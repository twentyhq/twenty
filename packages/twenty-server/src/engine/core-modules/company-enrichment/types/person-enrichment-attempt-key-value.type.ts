import { type PeopleDataLabsPersonEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-enrich-result.type';

export const PERSON_ENRICHMENT_ATTEMPT_KEY = 'PERSON_ENRICHMENT_ATTEMPT';

export type PersonEnrichmentAttemptKeyValueTypeMap = {
  [PERSON_ENRICHMENT_ATTEMPT_KEY]: {
    email: string;
    outcome: Exclude<PeopleDataLabsPersonEnrichResult['outcome'], 'skipped'>;
    httpStatus?: number;
    message?: string;
    attemptedAt: string;
  };
};
