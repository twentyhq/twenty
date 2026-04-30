import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  IN_TRANSIT = 'in_transit',
  CUSTOMS = 'customs',
  RECEIVED = 'received',
  CLOSED = 'closed',
}

export enum ShipmentStatus {
  BOOKED = 'booked',
  DEPARTED = 'departed',
  IN_TRANSIT = 'in_transit',
  CUSTOMS_HOLD = 'customs_hold',
  CLEARED = 'cleared',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
}

export enum Incoterm {
  FOB = 'FOB',
  CIF = 'CIF',
  DDP = 'DDP',
  EXW = 'EXW',
  FCA = 'FCA',
  CFR = 'CFR',
  CPT = 'CPT',
  DAP = 'DAP',
}

@Entity('purchase_order')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'supplierId'])
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  poNumber: string;

  @Column({ nullable: false })
  supplierId: string;

  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status: PurchaseOrderStatus;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: Incoterm, default: Incoterm.FOB })
  incoterm: Incoterm;

  @Column({ type: 'varchar', length: 100, nullable: true })
  originCountry: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  destinationCountry: string;

  @Column({ type: 'simple-json', nullable: true })
  lineItems: Array<{
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    hsCode: string;
    originCountry: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  documentIds: string[];

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  approverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('shipment')
@Index(['workspaceId', 'status'])
export class ShipmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  purchaseOrderId: string;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.BOOKED })
  status: ShipmentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  blNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  containerNumber: string;

  @Column({ type: 'date', nullable: true })
  etd: Date;

  @Column({ type: 'date', nullable: true })
  eta: Date;

  @Column({ type: 'date', nullable: true })
  actualArrival: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  portOfOrigin: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  portOfDestination: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  freightCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  insuranceCost: number;

  @Column({ type: 'float', nullable: true })
  carbonKg: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('customs_entry')
@Index(['workspaceId', 'shipmentId'])
export class CustomsEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  shipmentId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dutNumber: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  dutyAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  antidumpingDuty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  agentFees: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ftaApplied: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ftaSavingsPercent: number;

  @Column({ type: 'simple-json', nullable: true })
  documentChecklist: Array<{ name: string; required: boolean; uploaded: boolean; fileId?: string }>;

  @Column({ type: 'boolean', default: false })
  restrictedPartyCleared: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('landed_cost')
@Index(['workspaceId', 'purchaseOrderId'])
export class LandedCostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  purchaseOrderId: string;

  @Column({ nullable: false })
  productId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  productValue: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  freight: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  insurance: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  duties: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  vat: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  agentFees: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  otherCosts: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  totalLandedCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  unitLandedCost: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
