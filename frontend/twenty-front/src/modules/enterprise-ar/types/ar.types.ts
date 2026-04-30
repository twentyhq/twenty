export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'written_off';

export type AgingBucket =
  | 'current'
  | '1-30'
  | '31-60'
  | '61-90'
  | '90+';

export type DunningStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'escalated';

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAmount: number;
  agingBucket: AgingBucket;
  createdAt: string;
  updatedAt: string;
};

export type AgingReportEntry = {
  customerId: string;
  customerName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  total: number;
};

export type DunningSequence = {
  id: string;
  invoiceId: string;
  customerName: string;
  status: DunningStatus;
  currentStep: number;
  totalSteps: number;
  nextActionDate: string;
  paymentPromiseDate: string | null;
  paymentPromiseAmount: number | null;
};

export type CashForecastEntry = {
  date: string;
  expectedInflow: number;
  expectedOutflow: number;
  netCash: number;
  cumulativeBalance: number;
};
