export type TenantPlan =
  | 'free'
  | 'starter'
  | 'professional'
  | 'enterprise';

export type TenantStatus =
  | 'active'
  | 'trial'
  | 'suspended'
  | 'churned';

export type ModuleStatus =
  | 'active'
  | 'inactive'
  | 'trial';

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  mrr: number;
  currency: string;
  userCount: number;
  maxUsers: number;
  createdAt: string;
  trialEndsAt: string | null;
};

export type TenantModule = {
  id: string;
  tenantId: string;
  moduleKey: string;
  moduleName: string;
  status: ModuleStatus;
  activatedAt: string | null;
  trialEndsAt: string | null;
  monthlyPrice: number;
};

export type UsageMeter = {
  metricKey: string;
  metricLabel: string;
  currentUsage: number;
  limit: number;
  unit: string;
  percentUsed: number;
  overage: boolean;
};
