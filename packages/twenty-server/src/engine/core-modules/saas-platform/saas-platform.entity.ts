import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TenantStatus { TRIAL = 'trial', ACTIVE = 'active', PAST_DUE = 'past_due', SUSPENDED = 'suspended', CANCELLED = 'cancelled' }
export enum SubscriptionPlan { STARTER = 'starter', PROFESSIONAL = 'professional', ENTERPRISE = 'enterprise', CUSTOM = 'custom' }
export enum BillingCycle { MONTHLY = 'monthly', YEARLY = 'yearly' }
export enum CountryCode { CO = 'CO', MX = 'MX', DO = 'DO', CL = 'CL', PE = 'PE', AR = 'AR', BR = 'BR', EC = 'EC', PA = 'PA', US = 'US' }

// Tenant configuration for SaaS
@Entity('saas_tenant_config')
@Index(['workspaceId'], { unique: true })
export class TenantConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 100, nullable: false }) companyName: string;
  @Column({ type: 'enum', enum: CountryCode, default: CountryCode.CO }) country: CountryCode;
  @Column({ type: 'varchar', length: 20, nullable: true }) taxId: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) taxIdType: string;
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL }) status: TenantStatus;
  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.STARTER }) plan: SubscriptionPlan;
  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY }) billingCycle: BillingCycle;
  @Column({ type: 'varchar', length: 3, default: 'USD' }) currency: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) stripeCustomerId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) stripeSubscriptionId: string;
  @Column({ type: 'int', default: 14 }) trialDaysRemaining: number;
  @Column({ type: 'date', nullable: true }) trialEndsAt: Date;
  @Column({ type: 'date', nullable: true }) currentPeriodEnd: Date;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) mrr: number;
  @Column({ type: 'simple-json', nullable: true }) limits: { maxUsers: number; maxStorageGB: number; maxCallMinutes: number; maxEmployees: number };
  @Column({ type: 'simple-json', nullable: true }) usage: { currentUsers: number; storageUsedGB: number; callMinutesUsed: number; employees: number };
  @Column({ type: 'varchar', length: 50, nullable: true }) timezone: string;
  @Column({ type: 'varchar', length: 10, default: 'es' }) locale: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// Active modules per tenant
@Entity('saas_tenant_module')
@Index(['workspaceId', 'moduleCode'], { unique: true })
export class TenantModuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) moduleCode: string;
  @Column({ type: 'boolean', default: false }) isActive: boolean;
  @Column({ type: 'varchar', length: 20, default: 'flat' }) billingType: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) priceUSD: number;
  @Column({ type: 'timestamp', nullable: true }) activatedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) deactivatedAt: Date;
  @Column({ type: 'simple-json', nullable: true }) config: Record<string, unknown>;
  @Column({ type: 'simple-json', nullable: true }) features: Record<string, boolean>;
  @CreateDateColumn() createdAt: Date;
}

// Module catalog
@Entity('saas_module_catalog')
export class ModuleCatalogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 50, unique: true }) code: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) category: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) icon: string;
  @Column({ type: 'simple-json', nullable: true }) pricing: {
    starter: number | null; professional: number | null; enterprise: number | null;
    billingType: string; perUnit?: string;
  };
  @Column({ type: 'simple-json', nullable: true }) requiredModules: string[];
  @Column({ type: 'simple-json', nullable: true }) countryAvailability: string[];
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'int', default: 0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
}

// Fiscal connector configuration per tenant
@Entity('saas_fiscal_config')
@Index(['workspaceId', 'country'], { unique: true })
export class FiscalConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'enum', enum: CountryCode }) country: CountryCode;
  @Column({ type: 'boolean', default: false }) isActive: boolean;
  @Column({ type: 'boolean', default: true }) testMode: boolean;
  @Column({ type: 'varchar', length: 50, nullable: true }) provider: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) certificatePath: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) certificatePassword: string;
  @Column({ type: 'simple-json', nullable: true }) providerConfig: Record<string, string>;
  @Column({ type: 'simple-json', nullable: true }) taxRules: Array<{ name: string; rate: number; type: string }>;
  @Column({ type: 'varchar', length: 50, nullable: true }) invoicePrefix: string;
  @Column({ type: 'int', default: 0 }) lastInvoiceNumber: number;
  @Column({ type: 'varchar', length: 255, nullable: true }) resolutionNumber: string;
  @Column({ type: 'date', nullable: true }) resolutionExpiry: Date;
  @Column({ type: 'int', default: 0 }) invoicesSent: number;
  @Column({ type: 'int', default: 0 }) invoicesAccepted: number;
  @Column({ type: 'int', default: 0 }) invoicesRejected: number;
  @Column({ type: 'timestamp', nullable: true }) lastSyncAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// Cross-module event log (event bus bridge)
@Entity('saas_event_log')
@Index(['workspaceId', 'createdAt'])
@Index(['workspaceId', 'eventType'])
export class EventLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 100, nullable: false }) eventType: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) sourceModule: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) targetModule: string;
  @Column({ type: 'simple-json', nullable: true }) payload: Record<string, unknown>;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  @Column({ type: 'varchar', length: 20, default: 'normal' }) priority: string;
  @Column({ type: 'int', default: 0 }) retryCount: number;
  @Column({ type: 'text', nullable: true }) errorMessage: string;
  @Column({ type: 'timestamp', nullable: true }) processedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
