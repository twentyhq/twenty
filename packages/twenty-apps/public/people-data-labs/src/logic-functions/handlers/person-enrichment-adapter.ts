import { PERSON_MATCH_COST_DOLLARS } from 'src/constants/person-match-cost-dollars';
import { buildPersonMatchedData } from 'src/logic-functions/utils/build-person-matched-data';
import { enrichPeople } from 'src/logic-functions/utils/enrich-people';
import { extractPersonMatchParams } from 'src/logic-functions/utils/extract-person-match-params';
import { readPeople } from 'src/logic-functions/utils/read-people';
import { updatePeopleStatus } from 'src/logic-functions/utils/update-people-status';
import { updatePersonRecord } from 'src/logic-functions/utils/update-person-record';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type PeopleDataLabsPersonData, type PeopleDataLabsPersonEnrichParams } from 'twenty-shared/people-data-labs';
import { type PersonNode } from 'src/types/person-node';

export const personEnrichmentAdapter: BatchEnrichmentAdapter<
  PersonNode,
  PeopleDataLabsPersonData,
  PeopleDataLabsPersonEnrichParams
> = {
  objectNameSingular: 'Person',
  noIdentifierMessage:
    'No usable identifier (email, LinkedIn, PDL id, or name paired with a company) to match against PDL.',
  costPerMatchDollars: PERSON_MATCH_COST_DOLLARS,
  readRecords: readPeople,
  getNodeId: (node) => node.id,
  extractParams: extractPersonMatchParams,
  enrichBatch: enrichPeople,
  buildMatchedData: buildPersonMatchedData,
  updateOne: updatePersonRecord,
  updateManyStatus: updatePeopleStatus,
};
