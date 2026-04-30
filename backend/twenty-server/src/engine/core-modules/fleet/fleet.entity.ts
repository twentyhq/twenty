import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum VehicleStatus { AVAILABLE = 'available', IN_SERVICE = 'in_service', MAINTENANCE = 'maintenance', RETIRED = 'retired' }
export enum DeliveryStatus { PENDING = 'pending', ASSIGNED = 'assigned', EN_ROUTE = 'en_route', DELIVERED = 'delivered', FAILED = 'failed', RETURNED = 'returned' }
export enum MaintenanceType { PREVENTIVE = 'preventive', CORRECTIVE = 'corrective', INSPECTION = 'inspection' }
export enum FuelAlertType { HIGH_CONSUMPTION = 'high_consumption', SUDDEN_DROP = 'sudden_drop', OFF_HOURS_REFUEL = 'off_hours_refuel' }

@Entity('fleet_vehicle')
@Index(['workspaceId', 'status'])
export class FleetVehicleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) plateNumber: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) make: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) model: string;
  @Column({ type: 'int', nullable: true }) year: number;
  @Column({ type: 'varchar', length: 20, nullable: true }) vin: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) color: string;
  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE }) status: VehicleStatus;
  @Column({ type: 'int', default: 0 }) capacityKg: number;
  @Column({ type: 'float', default: 0 }) capacityM3: number;
  @Column({ type: 'int', default: 0 }) odometerKm: number;
  @Column({ type: 'varchar', length: 20, default: 'gasoline' }) fuelType: string;
  @Column({ type: 'int', default: 60 }) tankCapacityLiters: number;
  @Column({ type: 'date', nullable: true }) insuranceExpiry: Date;
  @Column({ type: 'varchar', length: 100, nullable: true }) insuranceProvider: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) insurancePolicyNumber: string;
  @Column({ type: 'date', nullable: true }) soatExpiry: Date;
  @Column({ type: 'date', nullable: true }) techReviewExpiry: Date;
  @Column({ type: 'date', nullable: true }) nextMaintenanceDate: Date;
  @Column({ type: 'int', nullable: true }) nextMaintenanceKm: number;
  @Column({ type: 'int', default: 10000 }) maintenanceIntervalKm: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) purchasePrice: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) currentValue: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) fuelCostTotal: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) maintenanceCostTotal: number;
  @Column({ type: 'float', nullable: true }) avgFuelConsumption: number;
  @Column({ type: 'float', nullable: true }) expectedFuelConsumption: number;
  @Column({ type: 'int', default: 0 }) totalDeliveries: number;
  @Column({ type: 'float', nullable: true }) costPerKm: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('fleet_driver')
@Index(['workspaceId'])
export class FleetDriverEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) licenseNumber: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) licenseCategory: string;
  @Column({ type: 'date', nullable: true }) licenseExpiry: Date;
  @Column({ type: 'varchar', length: 50, nullable: true }) phone: string;
  @Column({ nullable: true }) assignedVehicleId: string;
  @Column({ type: 'float', nullable: true }) currentLat: number;
  @Column({ type: 'float', nullable: true }) currentLng: number;
  @Column({ type: 'float', nullable: true }) currentSpeed: number;
  @Column({ type: 'varchar', length: 20, default: 'offline' }) trackingStatus: string;
  @Column({ type: 'timestamp', nullable: true }) lastLocationUpdate: Date;
  @Column({ type: 'boolean', default: true }) isAvailable: boolean;
  @Column({ type: 'float', default: 100 }) performanceScore: number;
  @Column({ type: 'int', default: 0 }) deliveriesCompleted: number;
  @Column({ type: 'float', default: 0 }) onTimeRate: number;
  @Column({ type: 'float', default: 0 }) avgCustomerRating: number;
  @Column({ type: 'float', default: 0 }) fuelEfficiencyScore: number;
  @Column({ type: 'int', default: 0 }) totalKmDriven: number;
  @Column({ type: 'simple-array', nullable: true }) zones: string[];
  @Column({ type: 'simple-array', nullable: true }) skills: string[];
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('fleet_delivery')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'driverId'])
@Index(['workspaceId', 'accountId'])
export class FleetDeliveryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) orderId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ nullable: true }) driverId: string;
  @Column({ nullable: true }) vehicleId: string;
  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING }) status: DeliveryStatus;
  @Column({ type: 'varchar', length: 500, nullable: true }) pickupAddress: string;
  @Column({ type: 'float', nullable: true }) pickupLat: number;
  @Column({ type: 'float', nullable: true }) pickupLng: number;
  @Column({ type: 'varchar', length: 500, nullable: true }) deliveryAddress: string;
  @Column({ type: 'float', nullable: true }) deliveryLat: number;
  @Column({ type: 'float', nullable: true }) deliveryLng: number;
  @Column({ type: 'float', nullable: true }) distanceKm: number;
  @Column({ type: 'int', nullable: true }) estimatedMinutes: number;
  @Column({ type: 'int', default: 0 }) routeOrder: number;
  @Column({ type: 'timestamp', nullable: true }) scheduledAt: Date;
  @Column({ type: 'timestamp', nullable: true }) windowStart: Date;
  @Column({ type: 'timestamp', nullable: true }) windowEnd: Date;
  @Column({ type: 'timestamp', nullable: true }) dispatchedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) enRouteAt: Date;
  @Column({ type: 'timestamp', nullable: true }) arrivedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) deliveredAt: Date;
  @Column({ type: 'text', nullable: true }) proofOfDeliverySignature: string | null;
  @Column({ type: 'simple-array', nullable: true }) proofPhotoIds: string[] | null;
  @Column({ type: 'float', nullable: true }) proofLat: number | null;
  @Column({ type: 'float', nullable: true }) proofLng: number | null;
  @Column({ type: 'float', nullable: true }) customerRating: number | null;
  @Column({ type: 'text', nullable: true }) customerFeedback: string;
  @Column({ type: 'text', nullable: true }) deliveryNotes: string;
  @Column({ type: 'text', nullable: true }) failureReason: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) trackingLink: string;
  @Column({ type: 'boolean', default: false }) customerNotified: boolean;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) fuelCost: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) laborCost: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) depreciationCost: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) totalCost: number;
  @Column({ type: 'simple-json', nullable: true }) items: Array<{ name: string; quantity: number; weight?: number }>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('fleet_route')
@Index(['workspaceId'])
export class FleetRouteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ nullable: true }) driverId: string;
  @Column({ nullable: true }) vehicleId: string;
  @Column({ type: 'date', nullable: false }) routeDate: Date;
  @Column({ type: 'simple-json', nullable: true }) stops: Array<{ deliveryId: string; order: number; address: string; lat: number; lng: number; windowStart?: string; windowEnd?: string }>;
  @Column({ type: 'float', default: 0 }) totalDistanceKm: number;
  @Column({ type: 'int', default: 0 }) estimatedMinutes: number;
  @Column({ type: 'int', default: 0 }) completedStops: number;
  @Column({ type: 'int', default: 0 }) totalStops: number;
  @Column({ type: 'varchar', length: 20, default: 'planned' }) status: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('fuel_log')
@Index(['workspaceId', 'vehicleId'])
export class FuelLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) vehicleId: string;
  @Column({ nullable: true }) driverId: string;
  @Column({ type: 'float', nullable: false }) liters: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false }) cost: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) pricePerLiter: number;
  @Column({ type: 'int', nullable: false }) odometerKm: number;
  @Column({ type: 'float', nullable: true }) consumptionKmPerLiter: number;
  @Column({ type: 'varchar', length: 255, nullable: true }) station: string;
  @Column({ type: 'boolean', default: false }) isAnomaly: boolean;
  @Column({ type: 'varchar', length: 50, nullable: true }) anomalyType: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('maintenance_order')
@Index(['workspaceId', 'vehicleId'])
export class MaintenanceOrderEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) vehicleId: string;
  @Column({ type: 'enum', enum: MaintenanceType, default: MaintenanceType.PREVENTIVE }) type: MaintenanceType;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', length: 20, default: 'scheduled' }) status: string;
  @Column({ type: 'date', nullable: true }) scheduledDate: Date;
  @Column({ type: 'date', nullable: true }) completedDate: Date;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) cost: number;
  @Column({ type: 'varchar', length: 255, nullable: true }) vendor: string;
  @Column({ type: 'int', nullable: true }) odometerAtService: number;
  @Column({ type: 'simple-json', nullable: true }) parts: Array<{ name: string; cost: number }>;
  @CreateDateColumn() createdAt: Date;
}
