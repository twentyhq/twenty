import { type WorkspaceCompanyEnrichmentResult } from 'twenty-shared/workspace';

export const COMPANY_ENRICHMENT_ATTEMPT_KEY = 'COMPANY_ENRICHMENT_ATTEMPT';

export type CompanyEnrichmentAttemptKeyValueTypeMap = {
  [COMPANY_ENRICHMENT_ATTEMPT_KEY]: {
    domain: string;
    outcome: WorkspaceCompanyEnrichmentResult['outcome'];
    attemptedAt: string;
  };
};
