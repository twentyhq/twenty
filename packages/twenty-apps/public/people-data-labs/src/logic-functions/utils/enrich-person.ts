import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichPerson = (
  params: PdlPersonEnrichParams[],
): Promise<PdlEnrichResult<PdlPersonData>[]> =>
  Promise.all(
    params.map((entry) =>
      postPdlSingleEnrich<PdlPersonData>({
        path: '/person/enrich',
        params: pruneUndefined({
          pdl_id: entry.pdlId,
          profile: entry.profile,
          email: entry.email,
          name: entry.name,
          company: entry.company,
          min_likelihood: entry.minLikelihood,
        }),
      }),
    ),
  );
