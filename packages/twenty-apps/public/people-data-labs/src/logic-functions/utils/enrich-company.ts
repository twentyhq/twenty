import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichCompany = (
  params: PdlCompanyEnrichParams[],
): Promise<PdlEnrichResult<PdlCompanyData>[]> =>
  Promise.all(
    params.map((entry) =>
      postPdlSingleEnrich<PdlCompanyData>({
        path: '/company/enrich',
        params: pruneUndefined({
          pdl_id: entry.pdlId,
          website: entry.website,
          profile: entry.profile,
          name: entry.name,
          min_likelihood: entry.minLikelihood,
        }),
      }),
    ),
  );
