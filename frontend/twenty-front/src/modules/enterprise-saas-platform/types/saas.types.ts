export type TenantStatus = 'active' | 'trial' | 'suspended' | 'churned';

export type TenantData = {
  id: string;
  name: string;
  plan: string;
  status: TenantStatus;
  mrr: number;
  users: number;
  createdAt: string;
};

export type MarketplaceModuleData = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isInstalled: boolean;
  rating: number;
  installs: number;
};

export type InvoiceData = {
  id: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  issuedAt: string;
  dueDate: string;
};
