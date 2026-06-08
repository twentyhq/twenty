import { postPdlEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichPerson = (
  params: PdlPersonEnrichParams,
): Promise<PdlEnrichResult<PdlPersonData>> =>
  postPdlEnrich<PdlPersonData>(
    '/person/enrich',
    pruneUndefined({
      pdl_id: params.pdlId,
      profile: params.profile,
      email: params.email,
      name: params.name,
      company: params.company,
      min_likelihood: params.minLikelihood,
      required: params.required,
    }),
  );
