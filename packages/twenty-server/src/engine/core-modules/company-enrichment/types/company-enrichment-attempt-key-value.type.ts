import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';
import { type PeopleDataLabsEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-enrich-result.type';

export const COMPANY_ENRICHMENT_ATTEMPT_KEY = 'COMPANY_ENRICHMENT_ATTEMPT';

export type CompanyEnrichmentAttemptKeyValueTypeMap = {
  [COMPANY_ENRICHMENT_ATTEMPT_KEY]: {
    domain: string;
    outcome: Exclude<
      PeopleDataLabsEnrichResult<PeopleDataLabsCompanyData>['outcome'],
      'skipped'
    >;
    httpStatus?: number;
    message?: string;
    attemptedAt: string;
  };
};
