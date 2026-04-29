import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum WorkOrderStatus { CREATED = 'created', SCHEDULED = 'scheduled', DISPATCHED = 'dispatched', EN_ROUTE = 'en_route', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', CANCELLED = 'cancelled' }

@Entity('work_order')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'technicianId'])
export class WorkOrderEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) ticketId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.CREATED }) status: WorkOrderStatus;
  @Column({ type: 'varchar', length: 50, default: 'repair' }) type: string;
  @Column({ type: 'varchar', length: 20, default: 'medium' }) priority: string;
  @Column({ nullable: true }) technicianId: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) address: string;
  @Column({ type: 'float', nullable: true }) latitude: number;
  @Column({ type: 'float', nullable: true }) longitude: number;
  @Column({ type: 'timestamp', nullable: true }) scheduledStart: Date;
  @Column({ type: 'timestamp', nullable: true }) scheduledEnd: Date;
  @Column({ type: 'timestamp', nullable: true }) actualStart: Date;
  @Column({ type: 'timestamp', nullable: true }) actualEnd: Date;
  @Column({ type: 'simple-json', nullable: true }) checklist: Array<{ item: string; completed: boolean }>;
  @Column({ type: 'simple-json', nullable: true }) partsUsed: Array<{ partId: string; name: string; quantity: number }> | null;
  @Column({ type: 'simple-array', nullable: true }) photoIds: string[] | null;
  @Column({ type: 'text', nullable: true }) customerSignature: string | null;
  @Column({ type: 'float', nullable: true }) customerRating: number;
  @Column({ type: 'boolean', default: false }) firstTimeFix: boolean;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) laborCost: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) partsCost: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('technician')
@Index(['workspaceId'])
export class TechnicianEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'simple-array', nullable: true }) skills: string[];
  @Column({ type: 'float', nullable: true }) currentLat: number;
  @Column({ type: 'float', nullable: true }) currentLng: number;
  @Column({ type: 'boolean', default: true }) isAvailable: boolean;
  @Column({ type: 'float', default: 100 }) performanceScore: number;
  @Column({ type: 'int', default: 0 }) completedOrders: number;
  @Column({ type: 'float', default: 0 }) firstTimeFixRate: number;
  @Column({ type: 'float', default: 0 }) avgCustomerRating: number;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('service_contract')
@Index(['workspaceId', 'accountId'])
export class ServiceContractEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'int', default: 0 }) visitsIncluded: number;
  @Column({ type: 'int', default: 0 }) visitsUsed: number;
  @Column({ type: 'int', default: 4 }) responseTimeHours: number;
  @Column({ type: 'date', nullable: true }) startDate: Date;
  @Column({ type: 'date', nullable: true }) endDate: Date;
  @Column({ type: 'boolean', default: false }) autoRenew: boolean;
  @CreateDateColumn() createdAt: Date;
}
