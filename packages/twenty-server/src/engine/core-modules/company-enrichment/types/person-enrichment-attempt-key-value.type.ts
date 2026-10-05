import { type PeopleDataLabsEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-enrich-result.type';
import { type PeopleDataLabsPersonData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-data.type';

export const PERSON_ENRICHMENT_ATTEMPT_KEY = 'PERSON_ENRICHMENT_ATTEMPT';

export type PersonEnrichmentAttemptKeyValueTypeMap = {
  [PERSON_ENRICHMENT_ATTEMPT_KEY]: {
    email: string;
    outcome: Exclude<
      PeopleDataLabsEnrichResult<PeopleDataLabsPersonData>['outcome'],
      'skipped'
    >;
    httpStatus?: number;
    message?: string;
    attemptedAt: string;
  };
};
