export type Company = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  domainName: string;
  address: string;
  accountOwnerId: string | null;
  linkedinUrl: { url: string; label: string };
  xUrl: { url: string; label: string };
  annualRecurringRevenue: { amountMicros: number | null; currencyCode: string };
  employees: number | null;
  idealCustomerProfile: boolean;
};
