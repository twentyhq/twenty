import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

export const PERSON_ENRICHMENT_KEY = 'PERSON_ENRICHMENT';

export type PersonEnrichmentKeyValueTypeMap = {
  [PERSON_ENRICHMENT_KEY]: Pick<
    WorkspacePersonEnrichment,
    'email' | 'jobTitle' | 'jobTitleLevels'
  >;
};
