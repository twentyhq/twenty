import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import {
  FleetVehicleEntity, FleetDriverEntity, FleetDeliveryEntity, FleetRouteEntity,
  FuelLogEntity, MaintenanceOrderEntity,
  VehicleStatus, DeliveryStatus, MaintenanceType,
} from './fleet.entity';

@Injectable()
export class FleetService {
  private readonly logger = new Logger(FleetService.name);

  constructor(
    @InjectRepository(FleetVehicleEntity) private readonly vehicleRepo: Repository<FleetVehicleEntity>,
    @InjectRepository(FleetDriverEntity) private readonly driverRepo: Repository<FleetDriverEntity>,
    @InjectRepository(FleetDeliveryEntity) private readonly deliveryRepo: Repository<FleetDeliveryEntity>,
    @InjectRepository(FleetRouteEntity) private readonly routeRepo: Repository<FleetRouteEntity>,
    @InjectRepository(FuelLogEntity) private readonly fuelRepo: Repository<FuelLogEntity>,
    @InjectRepository(MaintenanceOrderEntity) private readonly maintenanceRepo: Repository<MaintenanceOrderEntity>,
  ) {}

  // ==================== VEHICLE & DRIVER REGISTRY ====================

  async registerVehicle(workspaceId: string, data: Partial<FleetVehicleEntity>): Promise<FleetVehicleEntity> {
    return this.vehicleRepo.save(this.vehicleRepo.create({ workspaceId, ...data }));
  }

  async registerDriver(workspaceId: string, data: Partial<FleetDriverEntity>): Promise<FleetDriverEntity> {
    return this.driverRepo.save(this.driverRepo.create({ workspaceId, ...data }));
  }

  async assignVehicleToDriver(driverId: string, vehicleId: string): Promise<FleetDriverEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException(`Driver ${driverId} not found`);
    driver.assignedVehicleId = vehicleId;
    return this.driverRepo.save(driver);
  }

  // ==================== ROUTE OPTIMIZATION ====================

  async optimizeRoute(workspaceId: string, driverId: string, deliveryIds: string[]): Promise<FleetRouteEntity> {
    const deliveries = await this.deliveryRepo.find({ where: deliveryIds.map((id) => ({ id })) });
    if (!deliveries.length) throw new NotFoundException('No deliveries found');

    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    const startLat = driver?.currentLat ?? 4.6097;
    const startLng = driver?.currentLng ?? -74.0817;

    // Nearest-neighbor heuristic for TSP
    const ordered: FleetDeliveryEntity[] = [];
    const remaining = [...deliveries];
    let currentLat = startLat;
    let currentLng = startLng;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const d = remaining[i];
        if (d.deliveryLat && d.deliveryLng) {
          const dist = this.haversineKm(currentLat, currentLng, d.deliveryLat, d.deliveryLng);

          // Respect time windows: penalize stops outside window
          let penalty = 0;
          if (d.windowStart && new Date(d.windowStart) > new Date()) penalty += 50;

          if (dist + penalty < nearestDist) {
            nearestDist = dist + penalty;
            nearestIdx = i;
          }
        }
      }

      const next = remaining.splice(nearestIdx, 1)[0];
      ordered.push(next);
      currentLat = next.deliveryLat ?? currentLat;
      currentLng = next.deliveryLng ?? currentLng;
    }

    // Update delivery route order
    let totalDistance = 0;
    let prevLat = startLat;
    let prevLng = startLng;
    const stops: FleetRouteEntity['stops'] = [];

    for (let i = 0; i < ordered.length; i++) {
      const d = ordered[i];
      d.routeOrder = i;
      const segmentDist = this.haversineKm(prevLat, prevLng, d.deliveryLat ?? prevLat, d.deliveryLng ?? prevLng);
      totalDistance += segmentDist;
      d.distanceKm = segmentDist;
      d.estimatedMinutes = Math.round(segmentDist / 30 * 60); // ~30 km/h avg city
      await this.deliveryRepo.save(d);

      stops.push({
        deliveryId: d.id, order: i, address: d.deliveryAddress ?? '',
        lat: d.deliveryLat ?? 0, lng: d.deliveryLng ?? 0,
        windowStart: d.windowStart?.toISOString(), windowEnd: d.windowEnd?.toISOString(),
      });

      prevLat = d.deliveryLat ?? prevLat;
      prevLng = d.deliveryLng ?? prevLng;
    }

    return this.routeRepo.save(this.routeRepo.create({
      workspaceId, name: `Route ${new Date().toISOString().split('T')[0]}`,
      driverId, vehicleId: driver?.assignedVehicleId,
      routeDate: new Date(), stops, totalDistanceKm: Math.round(totalDistance * 10) / 10,
      estimatedMinutes: Math.round(totalDistance / 30 * 60),
      totalStops: ordered.length, status: 'planned',
    }));
  }

  // ==================== DISPATCH FROM DEAL ====================

  async createDelivery(workspaceId: string, data: Partial<FleetDeliveryEntity>): Promise<FleetDeliveryEntity> {
    const delivery = await this.deliveryRepo.save(this.deliveryRepo.create({ workspaceId, ...data }));
    delivery.trackingLink = `/tracking/${delivery.id}`;
    return this.deliveryRepo.save(delivery);
  }

  async autoDispatch(workspaceId: string, deliveryId: string): Promise<FleetDeliveryEntity> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException(`Delivery ${deliveryId} not found`);

    const drivers = await this.driverRepo.find({ where: { workspaceId, isAvailable: true } });
    if (!drivers.length) throw new NotFoundException('No available drivers');

    let best = drivers[0];
    let minDist = Infinity;

    for (const d of drivers) {
      if (d.currentLat && d.currentLng && delivery.deliveryLat && delivery.deliveryLng) {
        const dist = this.haversineKm(d.currentLat, d.currentLng, delivery.deliveryLat, delivery.deliveryLng);
        // Factor in vehicle capacity
        if (dist < minDist) {
          const vehicle = d.assignedVehicleId ? await this.vehicleRepo.findOne({ where: { id: d.assignedVehicleId } }) : null;
          const totalWeight = delivery.items?.reduce((s, i) => s + (i.weight ?? 0) * i.quantity, 0) ?? 0;
          if (!vehicle || vehicle.capacityKg >= totalWeight) {
            minDist = dist; best = d;
          }
        }
      }
    }

    delivery.driverId = best.id;
    delivery.vehicleId = best.assignedVehicleId;
    delivery.status = DeliveryStatus.ASSIGNED;
    delivery.dispatchedAt = new Date();
    best.isAvailable = false;
    await this.driverRepo.save(best);
    return this.deliveryRepo.save(delivery);
  }

  // ==================== REAL-TIME GPS TRACKING ====================

  async updateDriverLocation(driverId: string, lat: number, lng: number, speed?: number): Promise<void> {
    await this.driverRepo.update(driverId, {
      currentLat: lat, currentLng: lng,
      currentSpeed: speed ?? null,
      trackingStatus: 'online',
      lastLocationUpdate: new Date(),
    } as Partial<FleetDriverEntity>);
  }

  async getFleetPositions(workspaceId: string): Promise<Array<{ driverId: string; name: string; lat: number; lng: number; speed: number; status: string; vehiclePlate: string }>> {
    const drivers = await this.driverRepo.find({ where: { workspaceId, trackingStatus: 'online' } });
    const positions = [];
    for (const d of drivers) {
      let vehiclePlate = '';
      if (d.assignedVehicleId) {
        const v = await this.vehicleRepo.findOne({ where: { id: d.assignedVehicleId } });
        vehiclePlate = v?.plateNumber ?? '';
      }
      positions.push({
        driverId: d.id, name: d.name,
        lat: d.currentLat ?? 0, lng: d.currentLng ?? 0,
        speed: d.currentSpeed ?? 0, status: d.isAvailable ? 'available' : 'busy',
        vehiclePlate,
      });
    }
    return positions;
  }

  async getDeliveryTracking(deliveryId: string): Promise<{
    status: DeliveryStatus; driverName: string; driverLat: number; driverLng: number;
    estimatedMinutes: number; trackingLink: string;
  } | null> {
    const d = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!d || !d.driverId) return null;
    const driver = await this.driverRepo.findOne({ where: { id: d.driverId } });
    if (!driver) return null;

    let eta = d.estimatedMinutes ?? 0;
    if (driver.currentLat && driver.currentLng && d.deliveryLat && d.deliveryLng) {
      const distKm = this.haversineKm(driver.currentLat, driver.currentLng, d.deliveryLat, d.deliveryLng);
      eta = Math.round(distKm / 30 * 60);
    }

    return {
      status: d.status, driverName: driver.name,
      driverLat: driver.currentLat ?? 0, driverLng: driver.currentLng ?? 0,
      estimatedMinutes: eta, trackingLink: d.trackingLink ?? '',
    };
  }

  // ==================== CUSTOMER NOTIFICATIONS ====================

  async markEnRoute(deliveryId: string): Promise<FleetDeliveryEntity> {
    const d = await this.findDeliveryOrFail(deliveryId);
    d.status = DeliveryStatus.EN_ROUTE;
    d.enRouteAt = new Date();
    d.customerNotified = true;
    this.logger.log(`Delivery ${deliveryId} en route — notify customer: "Tu pedido está en camino"`);
    return this.deliveryRepo.save(d);
  }

  async markArrived(deliveryId: string): Promise<FleetDeliveryEntity> {
    const d = await this.findDeliveryOrFail(deliveryId);
    d.arrivedAt = new Date();
    this.logger.log(`Delivery ${deliveryId} arrived — notify customer: "Tu conductor ha llegado"`);
    return this.deliveryRepo.save(d);
  }

  async completeDelivery(deliveryId: string, proof: {
    signature?: string; photoIds?: string[]; lat?: number; lng?: number;
    customerRating?: number; customerFeedback?: string;
  }): Promise<FleetDeliveryEntity> {
    const d = await this.findDeliveryOrFail(deliveryId);
    d.status = DeliveryStatus.DELIVERED;
    d.deliveredAt = new Date();
    d.proofOfDeliverySignature = proof.signature ?? null;
    d.proofPhotoIds = proof.photoIds ?? null;
    d.proofLat = proof.lat ?? null;
    d.proofLng = proof.lng ?? null;
    d.customerRating = proof.customerRating ?? null;
    d.customerFeedback = proof.customerFeedback ?? '';

    // Calculate cost breakdown
    if (d.vehicleId && d.distanceKm) {
      const vehicle = await this.vehicleRepo.findOne({ where: { id: d.vehicleId } });
      if (vehicle) {
        const fuelCostPerKm = vehicle.avgFuelConsumption ? (1 / vehicle.avgFuelConsumption) * 5500 : 500; // COP/km
        d.fuelCost = Math.round(d.distanceKm * fuelCostPerKm);
        d.depreciationCost = vehicle.purchasePrice ? Math.round((Number(vehicle.purchasePrice) / 300000) * d.distanceKm) : 0;
        d.laborCost = Math.round((d.estimatedMinutes ?? 30) / 60 * 15000); // ~15k COP/hr
        d.totalCost = Number(d.fuelCost) + Number(d.depreciationCost) + Number(d.laborCost);

        vehicle.totalDeliveries++;
        await this.vehicleRepo.save(vehicle);
      }
    }

    // Update driver stats
    if (d.driverId) {
      const driver = await this.driverRepo.findOne({ where: { id: d.driverId } });
      if (driver) {
        driver.isAvailable = true;
        driver.deliveriesCompleted++;
        if (d.distanceKm) driver.totalKmDriven += Math.round(d.distanceKm);
        const allDone = await this.deliveryRepo.find({ where: { driverId: driver.id, status: DeliveryStatus.DELIVERED } });
        const onTime = allDone.filter((dl) => dl.scheduledAt && dl.deliveredAt && dl.deliveredAt <= dl.scheduledAt).length;
        driver.onTimeRate = allDone.length ? Math.round((onTime / allDone.length) * 100) : 100;
        const rated = allDone.filter((dl): dl is FleetDeliveryEntity & { customerRating: number } => dl.customerRating !== null);
        driver.avgCustomerRating = rated.length ? Math.round(rated.reduce((s, dl) => s + dl.customerRating, 0) / rated.length * 10) / 10 : 0;
        driver.performanceScore = Math.round(driver.onTimeRate * 0.4 + driver.avgCustomerRating * 10 * 0.3 + driver.fuelEfficiencyScore * 0.3);
        await this.driverRepo.save(driver);
      }
    }

    this.logger.log(`Delivery ${deliveryId} completed — notify customer: "Tu pedido fue entregado"`);
    return this.deliveryRepo.save(d);
  }

  async failDelivery(deliveryId: string, reason: string): Promise<FleetDeliveryEntity> {
    const d = await this.findDeliveryOrFail(deliveryId);
    d.status = DeliveryStatus.FAILED;
    d.failureReason = reason;
    if (d.driverId) {
      await this.driverRepo.update(d.driverId, { isAvailable: true });
    }
    return this.deliveryRepo.save(d);
  }

  // ==================== FUEL TRACKING & ANOMALY DETECTION ====================

  async recordFuel(workspaceId: string, vehicleId: string, data: {
    liters: number; cost: number; odometerKm: number; driverId?: string; station?: string;
  }): Promise<FuelLogEntity> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);

    const lastLog = await this.fuelRepo.findOne({
      where: { vehicleId }, order: { createdAt: 'DESC' },
    });

    const kmDriven = lastLog ? data.odometerKm - lastLog.odometerKm : 0;
    const consumption = kmDriven > 0 && data.liters > 0 ? kmDriven / data.liters : null;
    const pricePerLiter = data.liters > 0 ? data.cost / data.liters : null;

    // Anomaly detection
    let isAnomaly = false;
    let anomalyType: string | null = null;

    if (vehicle.expectedFuelConsumption && consumption) {
      if (consumption < vehicle.expectedFuelConsumption * 0.6) {
        isAnomaly = true;
        anomalyType = 'high_consumption';
        this.logger.warn(`FUEL ANOMALY: Vehicle ${vehicle.plateNumber} consumption ${consumption?.toFixed(1)} km/l vs expected ${vehicle.expectedFuelConsumption} km/l`);
      }
    }

    if (lastLog && kmDriven < 10 && data.liters > vehicle.tankCapacityLiters * 0.5) {
      isAnomaly = true;
      anomalyType = 'sudden_drop';
      this.logger.warn(`FUEL ANOMALY: Vehicle ${vehicle.plateNumber} refueled ${data.liters}L after only ${kmDriven}km`);
    }

    const now = new Date();
    if (now.getHours() < 5 || now.getHours() > 22) {
      isAnomaly = true;
      anomalyType = 'off_hours_refuel';
    }

    const log = await this.fuelRepo.save(this.fuelRepo.create({
      workspaceId, vehicleId, driverId: data.driverId ?? undefined, liters: data.liters,
      cost: data.cost, pricePerLiter: pricePerLiter ?? undefined, odometerKm: data.odometerKm,
      consumptionKmPerLiter: consumption ?? undefined, station: data.station, isAnomaly,
      anomalyType: anomalyType ?? undefined,
    }));

    // Update vehicle
    vehicle.fuelCostTotal = Number(vehicle.fuelCostTotal) + data.cost;
    vehicle.odometerKm = data.odometerKm;
    if (consumption) vehicle.avgFuelConsumption = consumption;
    if (kmDriven > 0) vehicle.costPerKm = Number(vehicle.fuelCostTotal) / vehicle.odometerKm;
    await this.vehicleRepo.save(vehicle);

    return log;
  }

  async getFuelAnomalies(workspaceId: string): Promise<FuelLogEntity[]> {
    return this.fuelRepo.find({ where: { workspaceId, isAnomaly: true }, order: { createdAt: 'DESC' }, take: 50 });
  }

  // ==================== MAINTENANCE ====================

  async getMaintenanceDue(workspaceId: string): Promise<FleetVehicleEntity[]> {
    const byDate = await this.vehicleRepo.find({
      where: { workspaceId, nextMaintenanceDate: LessThan(new Date(Date.now() + 7 * 86_400_000)) },
    });
    const all = await this.vehicleRepo.find({ where: { workspaceId } });
    const byKm = all.filter((v) => v.nextMaintenanceKm && v.odometerKm >= v.nextMaintenanceKm);
    const combined = [...byDate];
    for (const v of byKm) { if (!combined.find((c) => c.id === v.id)) combined.push(v); }
    return combined;
  }

  async createMaintenanceOrder(workspaceId: string, vehicleId: string, data: Partial<MaintenanceOrderEntity>): Promise<MaintenanceOrderEntity> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });
    if (vehicle) {
      vehicle.status = VehicleStatus.MAINTENANCE;
      await this.vehicleRepo.save(vehicle);
    }
    return this.maintenanceRepo.save(this.maintenanceRepo.create({ workspaceId, vehicleId, ...data }));
  }

  async completeMaintenanceOrder(orderId: string): Promise<MaintenanceOrderEntity> {
    const order = await this.maintenanceRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Maintenance order ${orderId} not found`);
    order.status = 'completed';
    order.completedDate = new Date();

    const vehicle = await this.vehicleRepo.findOne({ where: { id: order.vehicleId } });
    if (vehicle) {
      vehicle.status = VehicleStatus.AVAILABLE;
      vehicle.maintenanceCostTotal = Number(vehicle.maintenanceCostTotal) + Number(order.cost);
      vehicle.odometerKm = order.odometerAtService ?? vehicle.odometerKm;
      vehicle.nextMaintenanceKm = vehicle.odometerKm + vehicle.maintenanceIntervalKm;
      vehicle.nextMaintenanceDate = new Date(Date.now() + 90 * 86_400_000);
      await this.vehicleRepo.save(vehicle);
    }

    return this.maintenanceRepo.save(order);
  }

  // ==================== FLEET COST PER DELIVERY ====================

  async getCostPerDelivery(workspaceId: string): Promise<Array<{
    deliveryId: string; dealId: string | null; accountId: string | null;
    fuel: number; labor: number; depreciation: number; total: number;
  }>> {
    const deliveries = await this.deliveryRepo.find({
      where: { workspaceId, status: DeliveryStatus.DELIVERED },
      order: { deliveredAt: 'DESC' },
      take: 100,
    });

    return deliveries.map((d) => ({
      deliveryId: d.id, dealId: d.dealId, accountId: d.accountId,
      fuel: Number(d.fuelCost), labor: Number(d.laborCost),
      depreciation: Number(d.depreciationCost), total: Number(d.totalCost),
    }));
  }

  async getCostByClient(workspaceId: string): Promise<Array<{ accountId: string; deliveries: number; totalCost: number; avgCost: number }>> {
    const deliveries = await this.deliveryRepo.find({
      where: { workspaceId, status: DeliveryStatus.DELIVERED },
    });

    const byAccount: Record<string, { deliveries: number; totalCost: number }> = {};
    for (const d of deliveries) {
      const key = d.accountId ?? 'unassigned';
      if (!byAccount[key]) byAccount[key] = { deliveries: 0, totalCost: 0 };
      byAccount[key].deliveries++;
      byAccount[key].totalCost += Number(d.totalCost);
    }

    return Object.entries(byAccount).map(([accountId, data]) => ({
      accountId, deliveries: data.deliveries,
      totalCost: Math.round(data.totalCost),
      avgCost: Math.round(data.totalCost / data.deliveries),
    }));
  }

  // ==================== DRIVER PERFORMANCE ====================

  async getDriverPerformance(workspaceId: string): Promise<Array<{
    driverId: string; name: string; score: number; deliveries: number;
    onTimeRate: number; avgRating: number; fuelEfficiency: number; totalKm: number;
  }>> {
    const drivers = await this.driverRepo.find({ where: { workspaceId } });
    return drivers.map((d) => ({
      driverId: d.id, name: d.name, score: d.performanceScore,
      deliveries: d.deliveriesCompleted, onTimeRate: d.onTimeRate,
      avgRating: d.avgCustomerRating, fuelEfficiency: d.fuelEfficiencyScore,
      totalKm: d.totalKmDriven,
    })).sort((a, b) => b.score - a.score);
  }

  async updateDriverFuelEfficiency(workspaceId: string): Promise<void> {
    const drivers = await this.driverRepo.find({ where: { workspaceId } });
    for (const driver of drivers) {
      const fuelLogs = await this.fuelRepo.find({ where: { driverId: driver.id }, order: { createdAt: 'DESC' }, take: 20 });
      if (fuelLogs.length < 3) continue;
      const avgConsumption = fuelLogs.filter((l) => l.consumptionKmPerLiter).reduce((s, l) => s + (l.consumptionKmPerLiter ?? 0), 0) / fuelLogs.filter((l) => l.consumptionKmPerLiter).length;
      const vehicle = driver.assignedVehicleId ? await this.vehicleRepo.findOne({ where: { id: driver.assignedVehicleId } }) : null;
      const expected = vehicle?.expectedFuelConsumption ?? 12;
      driver.fuelEfficiencyScore = Math.min(100, Math.round((avgConsumption / expected) * 100));
      await this.driverRepo.save(driver);
    }
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(workspaceId: string): Promise<{
    totalVehicles: number; activeDeliveries: number; avgCostPerDelivery: number;
    onTimeRate: number; avgRating: number; totalKm: number; fuelCost: number;
    maintenanceCost: number; anomalyCount: number;
  }> {
    const vehicles = await this.vehicleRepo.find({ where: { workspaceId } });
    const deliveries = await this.deliveryRepo.find({ where: { workspaceId } });
    const completed = deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED);
    const active = deliveries.filter((d) => [DeliveryStatus.ASSIGNED, DeliveryStatus.EN_ROUTE].includes(d.status)).length;
    const avgCost = completed.length ? completed.reduce((s, d) => s + Number(d.totalCost), 0) / completed.length : 0;
    const onTime = completed.filter((d) => d.scheduledAt && d.deliveredAt && d.deliveredAt <= d.scheduledAt).length;
    const rated = completed.filter((d): d is FleetDeliveryEntity & { customerRating: number } => d.customerRating !== null);
    const anomalyCount = await this.fuelRepo.count({ where: { workspaceId, isAnomaly: true } });

    return {
      totalVehicles: vehicles.length, activeDeliveries: active,
      avgCostPerDelivery: Math.round(avgCost),
      onTimeRate: completed.length ? Math.round((onTime / completed.length) * 100) : 100,
      avgRating: rated.length ? Math.round(rated.reduce((s, d) => s + d.customerRating, 0) / rated.length * 10) / 10 : 0,
      totalKm: vehicles.reduce((s, v) => s + v.odometerKm, 0),
      fuelCost: vehicles.reduce((s, v) => s + Number(v.fuelCostTotal), 0),
      maintenanceCost: vehicles.reduce((s, v) => s + Number(v.maintenanceCostTotal), 0),
      anomalyCount,
    };
  }

  // ==================== HELPERS ====================

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private async findDeliveryOrFail(deliveryId: string): Promise<FleetDeliveryEntity> {
    const d = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!d) throw new NotFoundException(`Delivery ${deliveryId} not found`);
    return d;
  }
}
