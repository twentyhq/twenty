export type Company = {
  __typename: 'Company';
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  domainName:
    | string
    | {
        __typename?: 'Links';
        primaryLinkUrl: string;
        primaryLinkLabel: string;
      };
  address: string;
  accountOwnerId?: string | null;
  position?: number;
  linkedinLink: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  };
  xLink?: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  };
  annualRecurringRevenue: {
    __typename?: 'Currency';
    amountMicros: number | null;
    currencyCode: string;
  };
  employees: number | null;
  idealCustomerProfile?: boolean;
};
