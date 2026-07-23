import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import {
  type PeopleDataLabsCompanyData,
  type PeopleDataLabsCompanyEnrichParams,
  type PeopleDataLabsEnrichResult,
} from 'twenty-shared/people-data-labs';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichCompanies = (
  params: PeopleDataLabsCompanyEnrichParams[],
): Promise<PeopleDataLabsEnrichResult<PeopleDataLabsCompanyData>[]> =>
  postPdlBulkEnrich<PeopleDataLabsCompanyData>({
    path: '/company/enrich/bulk',
    requests: params.map((entry) =>
      pruneUndefined({
        pdl_id: entry.pdlId,
        website: entry.website,
        profile: entry.profile,
        name: entry.name,
        min_likelihood: entry.minLikelihood,
      }),
    ),
  });
