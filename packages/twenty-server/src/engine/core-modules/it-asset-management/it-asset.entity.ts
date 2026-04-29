import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  IN_MAINTENANCE = 'in_maintenance',
  RETIRED = 'retired',
  DISPOSED = 'disposed',
}

export enum AssetType {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  LICENSE = 'license',
  MOBILE = 'mobile',
  SERVER = 'server',
  NETWORK = 'network',
  API_KEY = 'api_key',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  NONE = 'none',
}

@Entity('it_asset')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'assignedToId'])
export class ITAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  assignedToId: string | undefined;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'enum', enum: DepreciationMethod, default: DepreciationMethod.STRAIGHT_LINE })
  depreciationMethod: DepreciationMethod;

  @Column({ type: 'int', default: 36 })
  usefulLifeMonths: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentValue: number;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'simple-json', nullable: true })
  specs: Record<string, string>;

  @Column({ type: 'simple-json', nullable: true })
  assignmentHistory: Array<{ userId: string; from: string; to: string }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('software_license')
@Index(['workspaceId'])
export class SoftwareLicenseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor: string;

  @Column({ type: 'int', default: 0 })
  totalSeats: number;

  @Column({ type: 'int', default: 0 })
  usedSeats: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  annualCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyCostPerSeat: number;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('it_ticket')
@Index(['workspaceId', 'status'])
export class ITTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  requesterId: string;

  @Column({ nullable: true })
  assigneeId: string;

  @Column({ nullable: true })
  assetId: string;

  @Column({ type: 'varchar', length: 50, default: 'access_request' })
  type: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('change_request')
@Index(['workspaceId'])
export class ChangeRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  rollbackPlan: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ nullable: true })
  requesterId: string;

  @Column({ nullable: true })
  approverId: string;

  @Column({ type: 'simple-array', nullable: true })
  affectedAssetIds: string[];

  @Column({ type: 'varchar', length: 20, default: 'low' })
  riskLevel: string;

  @CreateDateColumn()
  createdAt: Date;
}
