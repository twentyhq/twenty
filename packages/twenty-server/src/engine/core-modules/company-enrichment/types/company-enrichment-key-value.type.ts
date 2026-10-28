import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

export const COMPANY_ENRICHMENT_KEY = 'COMPANY_ENRICHMENT';

export type CompanyEnrichmentKeyValueTypeMap = {
  [COMPANY_ENRICHMENT_KEY]: Pick<
    WorkspaceCompanyEnrichment,
    'employeeCount' | 'industry'
  >;
};
