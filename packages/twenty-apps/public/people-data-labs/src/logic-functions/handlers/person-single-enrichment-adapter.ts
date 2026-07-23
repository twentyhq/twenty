import { personEnrichmentAdapter } from 'src/logic-functions/handlers/person-enrichment-adapter';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type PeopleDataLabsPersonData, type PeopleDataLabsPersonEnrichParams } from 'twenty-shared/people-data-labs';
import { type PersonNode } from 'src/types/person-node';

export const personSingleEnrichmentAdapter: BatchEnrichmentAdapter<
  PersonNode,
  PeopleDataLabsPersonData,
  PeopleDataLabsPersonEnrichParams
> = {
  ...personEnrichmentAdapter,
  enrichBatch: enrichPerson,
};
