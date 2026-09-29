import { PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-min-likelihood-env-var-name';
import { PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-weak-identifier-min-likelihood-env-var-name';
import { PERSON_MATCH_COST_DOLLARS } from 'src/constants/person-match-cost-dollars';
import { buildPersonMatchedData } from 'src/logic-functions/utils/build-person-matched-data';
import { enrichPeople } from 'src/logic-functions/utils/enrich-people';
import { extractPersonMatchParams } from 'src/logic-functions/utils/extract-person-match-params';
import { readPeople } from 'src/logic-functions/utils/read-people';
import { updatePeopleStatus } from 'src/logic-functions/utils/update-people-status';
import { updatePersonRecord } from 'src/logic-functions/utils/update-person-record';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { type PersonNode } from 'src/types/person-node';

export const personEnrichmentAdapter: BatchEnrichmentAdapter<
  PersonNode,
  PdlPersonData,
  PdlPersonEnrichParams
> = {
  objectNameSingular: 'Person',
  noIdentifierMessage:
    'No usable identifier (email, LinkedIn, PDL id, or name paired with a company) to match against PDL.',
  costPerMatchDollars: PERSON_MATCH_COST_DOLLARS,
  minLikelihoodEnvVarName: PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME,
  weakIdentifierMinLikelihoodEnvVarName:
    PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
  readRecords: readPeople,
  getNodeId: (node) => node.id,
  extractParams: extractPersonMatchParams,
  enrichBatch: enrichPeople,
  buildMatchedData: buildPersonMatchedData,
  updateOne: updatePersonRecord,
  updateManyStatus: updatePeopleStatus,
};
