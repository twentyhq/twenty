import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  TenantConfigEntity, TenantModuleEntity, ModuleCatalogEntity,
  FiscalConfigEntity, EventLogEntity,
  TenantStatus, SubscriptionPlan, CountryCode, BillingCycle,
} from './saas-platform.entity';

// Module code → FeatureFlagKey mapping
const MODULE_FLAG_MAP: Record<string, string> = {
  accounts_receivable: 'IS_MODULE_ACCOUNTS_RECEIVABLE_ENABLED',
  it_assets: 'IS_MODULE_IT_ASSETS_ENABLED',
  trade_import: 'IS_MODULE_TRADE_IMPORT_ENABLED',
  accounting: 'IS_MODULE_ACCOUNTING_ENABLED',
  fintech: 'IS_MODULE_FINTECH_ENABLED',
  support_ticket: 'IS_MODULE_SUPPORT_TICKET_ENABLED',
  knowledge_base: 'IS_MODULE_KNOWLEDGE_BASE_ENABLED',
  inventory: 'IS_MODULE_INVENTORY_ENABLED',
  marketing: 'IS_MODULE_MARKETING_ENABLED',
  gamification: 'IS_MODULE_GAMIFICATION_ENABLED',
  project: 'IS_MODULE_PROJECT_ENABLED',
  hrm: 'IS_MODULE_HRM_ENABLED',
  clm: 'IS_MODULE_CLM_ENABLED',
  field_service: 'IS_MODULE_FIELD_SERVICE_ENABLED',
  procurement: 'IS_MODULE_PROCUREMENT_ENABLED',
  events: 'IS_MODULE_EVENTS_ENABLED',
  lms: 'IS_MODULE_LMS_ENABLED',
  fleet: 'IS_MODULE_FLEET_ENABLED',
  asterisk: 'IS_MODULE_ASTERISK_ENABLED',
  prm: 'IS_MODULE_PRM_ENABLED',
  ecommerce: 'IS_MODULE_ECOMMERCE_ENABLED',
};

// Plan → included modules
const PLAN_MODULES: Record<string, string[]> = {
  [SubscriptionPlan.STARTER]: ['support_ticket', 'knowledge_base'],
  [SubscriptionPlan.PROFESSIONAL]: ['support_ticket', 'knowledge_base', 'marketing', 'inventory', 'project', 'gamification'],
  [SubscriptionPlan.ENTERPRISE]: Object.keys(MODULE_FLAG_MAP),
};

// Country → currency mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  CO: 'COP', MX: 'MXN', DO: 'DOP', CL: 'CLP', PE: 'PEN', AR: 'ARS', BR: 'BRL', EC: 'USD', PA: 'USD', US: 'USD',
};

// Country → tax rate
const COUNTRY_TAX: Record<string, number> = {
  CO: 0.19, MX: 0.16, DO: 0.18, CL: 0.19, PE: 0.18, AR: 0.21, BR: 0.18, EC: 0.15, PA: 0.07, US: 0,
};

// Country → timezone
const COUNTRY_TIMEZONE: Record<string, string> = {
  CO: 'America/Bogota', MX: 'America/Mexico_City', DO: 'America/Santo_Domingo',
  CL: 'America/Santiago', PE: 'America/Lima', AR: 'America/Argentina/Buenos_Aires',
  BR: 'America/Sao_Paulo', EC: 'America/Guayaquil', PA: 'America/Panama', US: 'America/New_York',
};

@Injectable()
export class SaaSPlatformService {
  private readonly logger = new Logger(SaaSPlatformService.name);

  constructor(
    @InjectRepository(TenantConfigEntity) private readonly tenantRepo: Repository<TenantConfigEntity>,
    @InjectRepository(TenantModuleEntity) private readonly moduleRepo: Repository<TenantModuleEntity>,
    @InjectRepository(ModuleCatalogEntity) private readonly catalogRepo: Repository<ModuleCatalogEntity>,
    @InjectRepository(FiscalConfigEntity) private readonly fiscalRepo: Repository<FiscalConfigEntity>,
    @InjectRepository(EventLogEntity) private readonly eventRepo: Repository<EventLogEntity>,
  ) {}

  // ==================== TENANT PROVISIONING ====================

  async provisionTenant(workspaceId: string, data: {
    companyName: string;
    country: CountryCode;
    plan?: SubscriptionPlan;
    taxId?: string;
  }): Promise<TenantConfigEntity> {
    const existing = await this.tenantRepo.findOne({ where: { workspaceId } });
    if (existing) return existing;

    const plan = data.plan ?? SubscriptionPlan.STARTER;
    const limits = this.getPlanLimits(plan);

    const tenant = await this.tenantRepo.save(this.tenantRepo.create({
      workspaceId,
      companyName: data.companyName,
      country: data.country,
      taxId: data.taxId,
      plan,
      status: TenantStatus.TRIAL,
      currency: COUNTRY_CURRENCY[data.country] ?? 'USD',
      timezone: COUNTRY_TIMEZONE[data.country] ?? 'UTC',
      trialEndsAt: new Date(Date.now() + 14 * 86_400_000),
      limits,
      usage: { currentUsers: 1, storageUsedGB: 0, callMinutesUsed: 0, employees: 0 },
    }));

    // Activate included modules for the plan
    const includedModules = PLAN_MODULES[plan] ?? [];
    for (const moduleCode of includedModules) {
      await this.activateModule(workspaceId, moduleCode);
    }

    // Setup fiscal connector if country has electronic invoicing
    const fiscalCountries: CountryCode[] = [CountryCode.CO, CountryCode.MX, CountryCode.DO, CountryCode.CL, CountryCode.PE, CountryCode.AR, CountryCode.BR];
    if (fiscalCountries.includes(data.country)) {
      await this.setupFiscalConnector(workspaceId, data.country);
    }

    await this.emitEvent(workspaceId, 'tenant.provisioned', 'platform', { plan, country: data.country });
    this.logger.log(`Tenant provisioned: ${data.companyName} (${data.country}) on plan ${plan}`);

    return tenant;
  }

  async getTenantConfig(workspaceId: string): Promise<TenantConfigEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { workspaceId } });
    if (!tenant) throw new NotFoundException(`Tenant config not found for workspace ${workspaceId}`);
    return tenant;
  }

  async updatePlan(workspaceId: string, newPlan: SubscriptionPlan): Promise<TenantConfigEntity> {
    const tenant = await this.getTenantConfig(workspaceId);
    const oldPlan = tenant.plan;
    tenant.plan = newPlan;
    tenant.limits = this.getPlanLimits(newPlan);

    // Activate/deactivate modules based on new plan
    const oldModules = new Set(PLAN_MODULES[oldPlan] ?? []);
    const newModules = new Set(PLAN_MODULES[newPlan] ?? []);

    for (const mod of newModules) {
      if (!oldModules.has(mod)) await this.activateModule(workspaceId, mod);
    }

    // Don't deactivate on downgrade — just mark as add-on billing
    await this.emitEvent(workspaceId, 'tenant.plan_changed', 'platform', { from: oldPlan, to: newPlan });
    return this.tenantRepo.save(tenant);
  }

  async suspendTenant(workspaceId: string, reason: string): Promise<void> {
    await this.tenantRepo.update({ workspaceId }, { status: TenantStatus.SUSPENDED });
    await this.emitEvent(workspaceId, 'tenant.suspended', 'platform', { reason });
    this.logger.warn(`Tenant ${workspaceId} suspended: ${reason}`);
  }

  async reactivateTenant(workspaceId: string): Promise<void> {
    await this.tenantRepo.update({ workspaceId }, { status: TenantStatus.ACTIVE });
    await this.emitEvent(workspaceId, 'tenant.reactivated', 'platform', {});
  }

  // ==================== MODULE ACTIVATION ====================

  async activateModule(workspaceId: string, moduleCode: string): Promise<TenantModuleEntity> {
    let mod = await this.moduleRepo.findOne({ where: { workspaceId, moduleCode } });
    if (mod?.isActive) return mod;

    // Check dependencies
    const catalog = await this.catalogRepo.findOne({ where: { code: moduleCode } });
    if (catalog?.requiredModules?.length) {
      for (const req of catalog.requiredModules) {
        const depMod = await this.moduleRepo.findOne({ where: { workspaceId, moduleCode: req, isActive: true } });
        if (!depMod) throw new ForbiddenException(`Module ${moduleCode} requires ${req} to be active first`);
      }
    }

    if (!mod) {
      mod = this.moduleRepo.create({ workspaceId, moduleCode, isActive: true, activatedAt: new Date() });
    } else {
      mod.isActive = true;
      mod.activatedAt = new Date();
      mod.deactivatedAt = undefined as unknown as Date;
    }

    if (catalog) {
      mod.billingType = catalog.pricing?.billingType ?? 'flat';
      mod.priceUSD = catalog.pricing?.enterprise ?? 0;
    }

    await this.emitEvent(workspaceId, 'module.activated', 'platform', { moduleCode });
    return this.moduleRepo.save(mod);
  }

  async deactivateModule(workspaceId: string, moduleCode: string): Promise<TenantModuleEntity> {
    const mod = await this.moduleRepo.findOne({ where: { workspaceId, moduleCode } });
    if (!mod) throw new NotFoundException(`Module ${moduleCode} not found`);

    // Check if other active modules depend on this one
    const allActive = await this.moduleRepo.find({ where: { workspaceId, isActive: true } });
    for (const activeMod of allActive) {
      const catalog = await this.catalogRepo.findOne({ where: { code: activeMod.moduleCode } });
      if (catalog?.requiredModules?.includes(moduleCode)) {
        throw new ForbiddenException(`Cannot deactivate ${moduleCode}: ${activeMod.moduleCode} depends on it`);
      }
    }

    mod.isActive = false;
    mod.deactivatedAt = new Date();
    await this.emitEvent(workspaceId, 'module.deactivated', 'platform', { moduleCode });
    return this.moduleRepo.save(mod);
  }

  async getActiveModules(workspaceId: string): Promise<TenantModuleEntity[]> {
    return this.moduleRepo.find({ where: { workspaceId, isActive: true } });
  }

  async isModuleActive(workspaceId: string, moduleCode: string): Promise<boolean> {
    const mod = await this.moduleRepo.findOne({ where: { workspaceId, moduleCode, isActive: true } });
    return !!mod;
  }

  // ==================== MODULE GUARD (middleware) ====================

  async checkModuleAccess(workspaceId: string, moduleCode: string): Promise<void> {
    const tenant = await this.getTenantConfig(workspaceId);

    if (tenant.status === TenantStatus.SUSPENDED) {
      throw new ForbiddenException('Tenant account is suspended. Contact support.');
    }

    if (tenant.status === TenantStatus.CANCELLED) {
      throw new ForbiddenException('Tenant account is cancelled.');
    }

    if (tenant.status === TenantStatus.TRIAL) {
      const trialEnd = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : new Date();
      if (trialEnd < new Date()) {
        throw new ForbiddenException('Trial period expired. Please subscribe to continue.');
      }
    }

    if (tenant.status === TenantStatus.PAST_DUE) {
      this.logger.warn(`Tenant ${workspaceId} is past due — allowing grace period access`);
    }

    const isActive = await this.isModuleActive(workspaceId, moduleCode);
    if (!isActive) {
      throw new ForbiddenException({
        error: 'Module not activated',
        moduleCode,
        message: `The ${moduleCode} module is not included in your plan. Upgrade or add it as an add-on.`,
        upgradeUrl: `/settings/billing/modules/${moduleCode}`,
      });
    }
  }

  // ==================== USAGE TRACKING ====================

  async trackUsage(workspaceId: string, metric: string, increment: number): Promise<void> {
    const tenant = await this.getTenantConfig(workspaceId);
    const usage = tenant.usage ?? { currentUsers: 0, storageUsedGB: 0, callMinutesUsed: 0, employees: 0 };

    switch (metric) {
      case 'users': usage.currentUsers += increment; break;
      case 'storage': usage.storageUsedGB += increment; break;
      case 'call_minutes': usage.callMinutesUsed += increment; break;
      case 'employees': usage.employees += increment; break;
    }

    // Check limits
    const limits = tenant.limits;
    if (limits) {
      if (metric === 'users' && usage.currentUsers > limits.maxUsers) {
        throw new ForbiddenException(`User limit reached (${limits.maxUsers}). Upgrade your plan.`);
      }
      if (metric === 'storage' && usage.storageUsedGB > limits.maxStorageGB) {
        throw new ForbiddenException(`Storage limit reached (${limits.maxStorageGB}GB). Upgrade your plan.`);
      }
      if (metric === 'call_minutes' && usage.callMinutesUsed > limits.maxCallMinutes) {
        throw new ForbiddenException(`Call minutes exhausted (${limits.maxCallMinutes}min). Add more minutes.`);
      }
    }

    tenant.usage = usage;
    await this.tenantRepo.save(tenant);
  }

  // ==================== BILLING CALCULATION ====================

  async calculateMonthlyInvoice(workspaceId: string): Promise<{
    subtotalUSD: number; taxRate: number; taxAmount: number; totalLocal: number;
    currency: string; lineItems: Array<{ module: string; type: string; quantity: number; unitPrice: number; total: number }>;
  }> {
    const tenant = await this.getTenantConfig(workspaceId);
    const modules = await this.getActiveModules(workspaceId);
    const lineItems: Array<{ module: string; type: string; quantity: number; unitPrice: number; total: number }> = [];

    let subtotalUSD = 0;

    for (const mod of modules) {
      let quantity = 1;
      let unitPrice = Number(mod.priceUSD);

      switch (mod.billingType) {
        case 'per_user':
          quantity = tenant.usage?.currentUsers ?? 1;
          break;
        case 'per_employee':
          quantity = tenant.usage?.employees ?? 0;
          break;
        case 'usage':
          if (mod.moduleCode === 'asterisk') quantity = tenant.usage?.callMinutesUsed ?? 0;
          break;
      }

      const total = unitPrice * quantity;
      subtotalUSD += total;
      lineItems.push({ module: mod.moduleCode, type: mod.billingType, quantity, unitPrice, total });
    }

    const taxRate = COUNTRY_TAX[tenant.country] ?? 0;
    const taxAmount = subtotalUSD * taxRate;

    return {
      subtotalUSD,
      taxRate,
      taxAmount,
      totalLocal: (subtotalUSD + taxAmount), // Would multiply by exchange rate in production
      currency: tenant.currency,
      lineItems,
    };
  }

  // ==================== FISCAL CONNECTORS ====================

  async setupFiscalConnector(workspaceId: string, country: CountryCode): Promise<FiscalConfigEntity> {
    const taxRules = this.getDefaultTaxRules(country);
    const provider = this.getDefaultFiscalProvider(country);

    return this.fiscalRepo.save(this.fiscalRepo.create({
      workspaceId, country, provider, taxRules, testMode: true,
    }));
  }

  async getFiscalConfig(workspaceId: string, country: CountryCode): Promise<FiscalConfigEntity | null> {
    return this.fiscalRepo.findOne({ where: { workspaceId, country } });
  }

  async activateFiscalProduction(workspaceId: string, country: CountryCode, data: {
    certificatePath: string; certificatePassword: string;
    resolutionNumber?: string; resolutionExpiry?: Date; invoicePrefix?: string;
  }): Promise<FiscalConfigEntity> {
    const config = await this.fiscalRepo.findOne({ where: { workspaceId, country } });
    if (!config) throw new NotFoundException(`Fiscal config not found for ${country}`);

    config.testMode = false;
    config.isActive = true;
    config.certificatePath = data.certificatePath;
    config.certificatePassword = data.certificatePassword;
    config.resolutionNumber = data.resolutionNumber ?? config.resolutionNumber;
    config.resolutionExpiry = data.resolutionExpiry ?? config.resolutionExpiry;
    config.invoicePrefix = data.invoicePrefix ?? config.invoicePrefix;

    await this.emitEvent(workspaceId, 'fiscal.activated', 'platform', { country, testMode: false });
    return this.fiscalRepo.save(config);
  }

  async getNextInvoiceNumber(workspaceId: string, country: CountryCode): Promise<string> {
    const config = await this.fiscalRepo.findOne({ where: { workspaceId, country } });
    if (!config) throw new NotFoundException(`Fiscal config not found for ${country}`);

    config.lastInvoiceNumber++;
    await this.fiscalRepo.save(config);

    const prefix = config.invoicePrefix ?? 'INV';
    const padded = String(config.lastInvoiceNumber).padStart(8, '0');

    switch (country) {
      case CountryCode.CO: return `${prefix}${padded}`;
      case CountryCode.MX: return `${prefix}${padded}`;
      case CountryCode.DO: return `E31${padded}`;
      case CountryCode.CL: return `${padded}`;
      default: return `${prefix}${padded}`;
    }
  }

  // ==================== EVENT BUS BRIDGE ====================

  async emitEvent(workspaceId: string, eventType: string, sourceModule: string, payload: Record<string, unknown>, targetModule?: string): Promise<EventLogEntity> {
    return this.eventRepo.save(this.eventRepo.create({
      workspaceId, eventType, sourceModule, targetModule, payload, status: 'pending',
    }));
  }

  async processEvents(workspaceId: string, limit = 50): Promise<number> {
    const pending = await this.eventRepo.find({
      where: { workspaceId, status: 'pending' },
      order: { createdAt: 'ASC' },
      take: limit,
    });

    let processed = 0;

    for (const event of pending) {
      try {
        await this.routeEvent(event);
        event.status = 'processed';
        event.processedAt = new Date();
        processed++;
      } catch (error) {
        event.retryCount++;
        event.errorMessage = error instanceof Error ? error.message : String(error);
        event.status = event.retryCount >= 3 ? 'failed' : 'pending';
      }
      await this.eventRepo.save(event);
    }

    return processed;
  }

  private async routeEvent(event: EventLogEntity): Promise<void> {
    // Cross-module event routing
    const routes: Record<string, string[]> = {
      'deal.closed': ['accounts_receivable', 'inventory', 'accounting', 'project', 'fleet'],
      'invoice.paid': ['accounting', 'fintech'],
      'invoice.overdue': ['accounts_receivable'],
      'ticket.created': ['support_ticket', 'knowledge_base'],
      'employee.hired': ['hrm', 'lms', 'it_assets'],
      'employee.terminated': ['hrm', 'it_assets'],
      'order.created': ['inventory', 'fleet', 'ecommerce'],
      'contract.expiring': ['clm', 'accounts_receivable'],
      'partner.deal_won': ['prm', 'accounting'],
      'call.completed': ['asterisk'],
      'work_order.completed': ['field_service', 'inventory'],
      'campaign.completed': ['marketing'],
    };

    const targets = routes[event.eventType] ?? (event.targetModule ? [event.targetModule] : []);

    for (const target of targets) {
      const isActive = await this.isModuleActive(event.workspaceId, target);
      if (isActive) {
        this.logger.log(`Event ${event.eventType} routed to ${target} for workspace ${event.workspaceId}`);
      }
    }
  }

  // ==================== MODULE CATALOG SEEDING ====================

  async seedModuleCatalog(): Promise<number> {
    const modules = [
      { code: 'accounts_receivable', name: 'Accounts Receivable', category: 'finance', pricing: { starter: null, professional: 25, enterprise: 0, billingType: 'flat' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'PE', 'AR', 'BR'], sortOrder: 1 },
      { code: 'it_assets', name: 'IT Asset Management', category: 'operations', pricing: { starter: null, professional: 15, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 2 },
      { code: 'trade_import', name: 'Trade & Import', category: 'operations', pricing: { starter: null, professional: null, enterprise: 0, billingType: 'flat' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'PE'], requiredModules: ['inventory'], sortOrder: 3 },
      { code: 'accounting', name: 'Accounting Integration', category: 'finance', pricing: { starter: null, professional: 30, enterprise: 0, billingType: 'flat' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'PE', 'AR', 'BR'], sortOrder: 4 },
      { code: 'fintech', name: 'FinTech Layer', category: 'finance', pricing: { starter: null, professional: null, enterprise: 0, billingType: 'usage' }, countryAvailability: ['CO', 'MX', 'DO'], requiredModules: ['accounts_receivable'], sortOrder: 5 },
      { code: 'support_ticket', name: 'Helpdesk & Support', category: 'service', pricing: { starter: 0, professional: 0, enterprise: 0, billingType: 'per_user' }, countryAvailability: ['*'], sortOrder: 6 },
      { code: 'knowledge_base', name: 'Knowledge Base', category: 'service', pricing: { starter: 0, professional: 0, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 7 },
      { code: 'inventory', name: 'Inventory Management', category: 'operations', pricing: { starter: null, professional: 25, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 8 },
      { code: 'marketing', name: 'Marketing Campaigns', category: 'marketing', pricing: { starter: null, professional: 0, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 9 },
      { code: 'gamification', name: 'Gamification', category: 'sales', pricing: { starter: null, professional: 0, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 10 },
      { code: 'project', name: 'Project Management', category: 'operations', pricing: { starter: null, professional: 0, enterprise: 0, billingType: 'per_user' }, countryAvailability: ['*'], sortOrder: 11 },
      { code: 'hrm', name: 'HRM & Payroll', category: 'hr', pricing: { starter: null, professional: null, enterprise: 5, billingType: 'per_employee' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'PE'], sortOrder: 12 },
      { code: 'clm', name: 'Contract Lifecycle', category: 'legal', pricing: { starter: null, professional: 20, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 13 },
      { code: 'field_service', name: 'Field Service', category: 'operations', pricing: { starter: null, professional: null, enterprise: 10, billingType: 'per_user', perUnit: 'technician' }, countryAvailability: ['*'], sortOrder: 14 },
      { code: 'procurement', name: 'Procurement', category: 'operations', pricing: { starter: null, professional: null, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], requiredModules: ['inventory'], sortOrder: 15 },
      { code: 'events', name: 'Events & Webinars', category: 'marketing', pricing: { starter: null, professional: 15, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 16 },
      { code: 'lms', name: 'Learning Management', category: 'hr', pricing: { starter: null, professional: 10, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 17 },
      { code: 'fleet', name: 'Fleet & Logistics', category: 'operations', pricing: { starter: null, professional: null, enterprise: 35, billingType: 'flat' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'PE'], sortOrder: 18 },
      { code: 'asterisk', name: 'VoIP & Telephony', category: 'communications', pricing: { starter: null, professional: 15, enterprise: 0, billingType: 'per_user' }, countryAvailability: ['*'], sortOrder: 19 },
      { code: 'prm', name: 'Partner Management', category: 'sales', pricing: { starter: null, professional: null, enterprise: 0, billingType: 'flat' }, countryAvailability: ['*'], sortOrder: 20 },
      { code: 'ecommerce', name: 'E-Commerce', category: 'sales', pricing: { starter: null, professional: null, enterprise: 49, billingType: 'flat' }, countryAvailability: ['CO', 'MX', 'DO', 'CL', 'BR'], sortOrder: 21 },
    ];

    let seeded = 0;
    for (const mod of modules) {
      const existing = await this.catalogRepo.findOne({ where: { code: mod.code } });
      if (!existing) {
        await this.catalogRepo.save(this.catalogRepo.create(mod as Partial<ModuleCatalogEntity>));
        seeded++;
      }
    }
    return seeded;
  }

  // ==================== ADMIN DASHBOARD ====================

  async getAdminDashboard(): Promise<{
    totalTenants: number; activeTenants: number; trialTenants: number;
    totalMRR: number; byCountry: Record<string, number>; byPlan: Record<string, number>;
    moduleAdoption: Array<{ module: string; tenants: number }>;
  }> {
    const tenants = await this.tenantRepo.find();
    const modules = await this.moduleRepo.find({ where: { isActive: true } });

    const byCountry: Record<string, number> = {};
    const byPlan: Record<string, number> = {};
    for (const t of tenants) {
      byCountry[t.country] = (byCountry[t.country] ?? 0) + 1;
      byPlan[t.plan] = (byPlan[t.plan] ?? 0) + 1;
    }

    const moduleCount: Record<string, number> = {};
    for (const m of modules) {
      moduleCount[m.moduleCode] = (moduleCount[m.moduleCode] ?? 0) + 1;
    }

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t) => t.status === TenantStatus.ACTIVE).length,
      trialTenants: tenants.filter((t) => t.status === TenantStatus.TRIAL).length,
      totalMRR: tenants.reduce((s, t) => s + Number(t.mrr), 0),
      byCountry,
      byPlan,
      moduleAdoption: Object.entries(moduleCount)
        .map(([module, count]) => ({ module, tenants: count }))
        .sort((a, b) => b.tenants - a.tenants),
    };
  }

  // ==================== HELPERS ====================

  private getPlanLimits(plan: SubscriptionPlan): TenantConfigEntity['limits'] {
    const limits: Record<string, TenantConfigEntity['limits']> = {
      [SubscriptionPlan.STARTER]: { maxUsers: 3, maxStorageGB: 10, maxCallMinutes: 100, maxEmployees: 0 },
      [SubscriptionPlan.PROFESSIONAL]: { maxUsers: 25, maxStorageGB: 100, maxCallMinutes: 1000, maxEmployees: 50 },
      [SubscriptionPlan.ENTERPRISE]: { maxUsers: 999, maxStorageGB: 1000, maxCallMinutes: 10000, maxEmployees: 500 },
      [SubscriptionPlan.CUSTOM]: { maxUsers: 9999, maxStorageGB: 5000, maxCallMinutes: 99999, maxEmployees: 9999 },
    };
    return limits[plan] ?? limits[SubscriptionPlan.STARTER];
  }

  private getDefaultTaxRules(country: CountryCode): FiscalConfigEntity['taxRules'] {
    const rules: Record<string, FiscalConfigEntity['taxRules']> = {
      CO: [{ name: 'IVA', rate: 19, type: 'vat' }, { name: 'ReteFuente', rate: 4, type: 'withholding' }, { name: 'ICA', rate: 0.69, type: 'municipal' }],
      MX: [{ name: 'IVA', rate: 16, type: 'vat' }, { name: 'ISR', rate: 10, type: 'withholding' }],
      DO: [{ name: 'ITBIS', rate: 18, type: 'vat' }],
      CL: [{ name: 'IVA', rate: 19, type: 'vat' }],
      PE: [{ name: 'IGV', rate: 18, type: 'vat' }],
      AR: [{ name: 'IVA', rate: 21, type: 'vat' }, { name: 'IIBB', rate: 3.5, type: 'provincial' }],
      BR: [{ name: 'ICMS', rate: 18, type: 'state' }, { name: 'ISS', rate: 5, type: 'municipal' }, { name: 'PIS/COFINS', rate: 9.25, type: 'federal' }],
    };
    return rules[country] ?? [{ name: 'VAT', rate: COUNTRY_TAX[country] * 100, type: 'vat' }];
  }

  private getDefaultFiscalProvider(country: CountryCode): string {
    const providers: Record<string, string> = {
      CO: 'dian_direct', MX: 'pac_edicom', DO: 'dgii_direct',
      CL: 'sii_direct', PE: 'sunat_direct', AR: 'afip_direct', BR: 'sefaz_direct',
    };
    return providers[country] ?? 'generic';
  }
}
