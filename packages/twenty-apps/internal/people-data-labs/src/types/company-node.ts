export type CompanyNode = {
  id: string;
  name?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  address?: {
    addressStreet1?: string | null;
    addressStreet2?: string | null;
    addressCity?: string | null;
    addressPostcode?: string | null;
    addressState?: string | null;
    addressCountry?: string | null;
  } | null;
  pdlId?: string | null;
  pdlLastEnrichedAt?: string | null;
};
