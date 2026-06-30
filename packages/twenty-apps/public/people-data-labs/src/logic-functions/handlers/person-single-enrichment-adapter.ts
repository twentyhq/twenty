import { personEnrichmentAdapter } from 'src/logic-functions/handlers/person-enrichment-adapter';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { type PersonNode } from 'src/types/person-node';

export const personSingleEnrichmentAdapter: BatchEnrichmentAdapter<
  PersonNode,
  PdlPersonData,
  PdlPersonEnrichParams
> = {
  ...personEnrichmentAdapter,
  enrichBatch: enrichPerson,
};
