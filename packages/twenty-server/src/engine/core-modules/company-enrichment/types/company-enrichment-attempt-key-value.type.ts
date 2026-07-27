import { type PeopleDataLabsCompanyEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-enrich-result.type';

export const COMPANY_ENRICHMENT_ATTEMPT_KEY = 'COMPANY_ENRICHMENT_ATTEMPT';

export type CompanyEnrichmentAttemptKeyValueTypeMap = {
  [COMPANY_ENRICHMENT_ATTEMPT_KEY]: {
    domain: string;
    outcome: Exclude<PeopleDataLabsCompanyEnrichResult['outcome'], 'skipped'>;
    httpStatus?: number;
    message?: string;
    attemptedAt: string;
  };
};
