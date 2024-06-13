export type Company = {
  __typename: 'Company';
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  domainName: string;
  address: string;
  accountOwnerId?: string | null;
  position?: number;
  linkedinLink: { __typename?: 'Link'; url: string; label: string };
  xLink?: { __typename?: 'Link'; url: string; label: string };
  annualRecurringRevenue: {
    __typename?: 'Currency';
    amountMicros: number | null;
    currencyCode: string;
  };
  employees: number | null;
  idealCustomerProfile?: boolean;
};
