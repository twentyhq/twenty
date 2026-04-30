import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderEntity, TechnicianEntity, ServiceContractEntity, WorkOrderStatus } from './field-service.entity';

@Injectable()
export class FieldServiceService {
  constructor(
    @InjectRepository(WorkOrderEntity) private readonly woRepo: Repository<WorkOrderEntity>,
    @InjectRepository(TechnicianEntity) private readonly techRepo: Repository<TechnicianEntity>,
    @InjectRepository(ServiceContractEntity) private readonly contractRepo: Repository<ServiceContractEntity>,
  ) {}

  async createWorkOrder(workspaceId: string, data: Partial<WorkOrderEntity>): Promise<WorkOrderEntity> {
    return this.woRepo.save(this.woRepo.create({ workspaceId, ...data }));
  }

  async autoDispatch(workspaceId: string, workOrderId: string): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`Work order ${workOrderId} not found`);

    const techs = await this.techRepo.find({ where: { workspaceId, isAvailable: true } });
    if (!techs.length) throw new NotFoundException('No available technicians');

    let best = techs[0];
    if (wo.latitude && wo.longitude) {
      let minDist = Infinity;
      for (const t of techs) {
        if (t.currentLat && t.currentLng) {
          const dist = Math.sqrt(Math.pow(t.currentLat - wo.latitude, 2) + Math.pow(t.currentLng - wo.longitude, 2));
          const hasSkill = !wo.type || t.skills?.includes(wo.type);
          if (dist < minDist && hasSkill) { minDist = dist; best = t; }
        }
      }
    }

    wo.technicianId = best.id;
    wo.status = WorkOrderStatus.DISPATCHED;
    best.isAvailable = false;
    await this.techRepo.save(best);
    return this.woRepo.save(wo);
  }

  async startWork(workOrderId: string): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`WO ${workOrderId} not found`);
    wo.status = WorkOrderStatus.IN_PROGRESS;
    wo.actualStart = new Date();
    return this.woRepo.save(wo);
  }

  async completeWork(workOrderId: string, data: { signature?: string; photoIds?: string[]; partsUsed?: Array<{ partId: string; name: string; quantity: number }>; firstTimeFix?: boolean }): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`WO ${workOrderId} not found`);
    wo.status = WorkOrderStatus.COMPLETED;
    wo.actualEnd = new Date();
    wo.customerSignature = data.signature ?? null;
    wo.photoIds = data.photoIds ?? null;
    wo.partsUsed = data.partsUsed ?? null;
    wo.firstTimeFix = data.firstTimeFix ?? true;

    if (wo.technicianId) {
      const tech = await this.techRepo.findOne({ where: { id: wo.technicianId } });
      if (tech) {
        tech.isAvailable = true;
        tech.completedOrders++;
        const allOrders = await this.woRepo.find({ where: { technicianId: tech.id, status: WorkOrderStatus.COMPLETED } });
        tech.firstTimeFixRate = allOrders.filter((o) => o.firstTimeFix).length / allOrders.length * 100;
        tech.avgCustomerRating = allOrders.filter((o) => o.customerRating).reduce((s, o) => s + o.customerRating, 0) / (allOrders.filter((o) => o.customerRating).length || 1);
        await this.techRepo.save(tech);
      }
    }
    return this.woRepo.save(wo);
  }

  async updateTechnicianLocation(techId: string, lat: number, lng: number): Promise<void> {
    await this.techRepo.update(techId, { currentLat: lat, currentLng: lng });
  }

  async registerTechnician(workspaceId: string, data: Partial<TechnicianEntity>): Promise<TechnicianEntity> {
    return this.techRepo.save(this.techRepo.create({ workspaceId, ...data }));
  }

  async createServiceContract(workspaceId: string, data: Partial<ServiceContractEntity>): Promise<ServiceContractEntity> {
    return this.contractRepo.save(this.contractRepo.create({ workspaceId, ...data }));
  }

  // --- AVAILABLE TECHNICIANS ---
  async getAvailableTechnicians(
    workspaceId: string,
    skillRequired?: string,
    location?: { lat: number; lng: number },
  ): Promise<Array<{ id: string; name: string; skills: string[]; distance: number | null; performanceScore: number }>> {
    const techs = await this.techRepo.find({ where: { workspaceId, isAvailable: true } });

    let filtered = techs;
    if (skillRequired) {
      filtered = filtered.filter((t) => t.skills?.includes(skillRequired));
    }

    const results = filtered.map((t) => {
      let distance: number | null = null;
      if (location && t.currentLat && t.currentLng) {
        distance = Math.sqrt(
          Math.pow(t.currentLat - location.lat, 2) + Math.pow(t.currentLng - location.lng, 2),
        );
      }
      return {
        id: t.id,
        name: t.name,
        skills: t.skills ?? [],
        distance,
        performanceScore: t.performanceScore,
      };
    });

    // Sort by distance if location provided, otherwise by performance
    if (location) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      results.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    return results;
  }

  // --- SERVICE REPORT ---
  async createServiceReport(
    workOrderId: string,
    data: { findings: string; actions: string; partsUsed: Array<{ partId: string; name: string; quantity: number }>; recommendations: string },
  ): Promise<{
    workOrderId: string;
    technicianId: string | null;
    generatedAt: string;
    findings: string;
    actions: string;
    partsUsed: Array<{ partId: string; name: string; quantity: number }>;
    recommendations: string;
    workOrderStatus: WorkOrderStatus;
  }> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`Work order ${workOrderId} not found`);

    // Update the work order with parts used
    wo.partsUsed = data.partsUsed;
    await this.woRepo.save(wo);

    return {
      workOrderId: wo.id,
      technicianId: wo.technicianId ?? null,
      generatedAt: new Date().toISOString(),
      findings: data.findings,
      actions: data.actions,
      partsUsed: data.partsUsed,
      recommendations: data.recommendations,
      workOrderStatus: wo.status,
    };
  }

  // --- PREDICTIVE MAINTENANCE ---
  async getPredictiveMaintenanceAlerts(
    workspaceId: string,
  ): Promise<Array<{
    accountId: string;
    equipmentType: string;
    completedOrderCount: number;
    avgDaysBetweenOrders: number;
    daysSinceLastOrder: number;
    alert: string;
  }>> {
    const completedOrders = await this.woRepo.find({
      where: { workspaceId, status: WorkOrderStatus.COMPLETED },
      order: { actualEnd: 'ASC' },
    });

    // Group by accountId + type to detect patterns
    const groupKey = (wo: WorkOrderEntity) => `${wo.accountId ?? 'unknown'}::${wo.type}`;
    const groups = new Map<string, WorkOrderEntity[]>();
    for (const wo of completedOrders) {
      const key = groupKey(wo);
      const existing = groups.get(key) ?? [];
      existing.push(wo);
      groups.set(key, existing);
    }

    const alerts: Array<{
      accountId: string;
      equipmentType: string;
      completedOrderCount: number;
      avgDaysBetweenOrders: number;
      daysSinceLastOrder: number;
      alert: string;
    }> = [];

    const now = Date.now();

    for (const [key, orders] of groups.entries()) {
      if (orders.length < 2) continue;

      const [accountId, equipmentType] = key.split('::');

      // Calculate average interval between service visits
      const intervals: number[] = [];
      for (let i = 1; i < orders.length; i++) {
        const prev = orders[i - 1].actualEnd?.getTime() ?? 0;
        const curr = orders[i].actualEnd?.getTime() ?? 0;
        if (prev && curr) {
          intervals.push((curr - prev) / 86_400_000);
        }
      }

      if (!intervals.length) continue;

      const avgDays = intervals.reduce((s, d) => s + d, 0) / intervals.length;
      const lastOrderDate = orders[orders.length - 1].actualEnd?.getTime() ?? 0;
      const daysSinceLast = lastOrderDate ? (now - lastOrderDate) / 86_400_000 : 0;

      // Alert if approaching or past the average service interval
      if (daysSinceLast >= avgDays * 0.8) {
        alerts.push({
          accountId,
          equipmentType,
          completedOrderCount: orders.length,
          avgDaysBetweenOrders: Math.round(avgDays),
          daysSinceLastOrder: Math.round(daysSinceLast),
          alert: daysSinceLast >= avgDays
            ? `Overdue: ${Math.round(daysSinceLast - avgDays)} days past expected service interval`
            : `Upcoming: service likely needed within ${Math.round(avgDays - daysSinceLast)} days`,
        });
      }
    }

    return alerts.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);
  }

  async getAnalytics(workspaceId: string): Promise<{ totalOrders: number; completed: number; ftfr: number; avgRating: number; avgResponseMinutes: number }> {
    const orders = await this.woRepo.find({ where: { workspaceId } });
    const completed = orders.filter((o) => o.status === WorkOrderStatus.COMPLETED);
    const ftfr = completed.length ? completed.filter((o) => o.firstTimeFix).length / completed.length * 100 : 0;
    const rated = completed.filter((o) => o.customerRating);
    const avgRating = rated.length ? rated.reduce((s, o) => s + o.customerRating, 0) / rated.length : 0;
    const withTimes = completed.filter((o) => o.actualStart && o.createdAt);
    const avgResponse = withTimes.length ? withTimes.reduce((s, o) => s + (o.actualStart.getTime() - o.createdAt.getTime()) / 60_000, 0) / withTimes.length : 0;
    return { totalOrders: orders.length, completed: completed.length, ftfr: Math.round(ftfr), avgRating: Math.round(avgRating * 10) / 10, avgResponseMinutes: Math.round(avgResponse) };
  }
}
