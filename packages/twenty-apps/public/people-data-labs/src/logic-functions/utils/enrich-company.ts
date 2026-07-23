import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';
import {
  type PeopleDataLabsCompanyData,
  type PeopleDataLabsCompanyEnrichParams,
  type PeopleDataLabsEnrichResult,
} from 'twenty-shared/people-data-labs';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichCompany = (
  params: PeopleDataLabsCompanyEnrichParams[],
): Promise<PeopleDataLabsEnrichResult<PeopleDataLabsCompanyData>[]> =>
  Promise.all(
    params.map((entry) =>
      postPdlSingleEnrich<PeopleDataLabsCompanyData>({
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
