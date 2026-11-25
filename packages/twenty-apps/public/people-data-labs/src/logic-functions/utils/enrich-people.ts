import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichPeople = (
  params: PdlPersonEnrichParams[],
): Promise<PdlEnrichResult<PdlPersonData>[]> =>
  postPdlBulkEnrich<PdlPersonData>({
    path: '/person/bulk',
    requests: params.map((entry) =>
      pruneUndefined({
        pdl_id: entry.pdlId,
        profile: entry.profile,
        email: entry.email,
        name: entry.name,
        company: entry.company,
        min_likelihood: entry.minLikelihood,
        required: entry.required,
      }),
    ),
  });
