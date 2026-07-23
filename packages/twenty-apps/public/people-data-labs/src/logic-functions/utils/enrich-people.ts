import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import {
  type PeopleDataLabsEnrichResult,
  type PeopleDataLabsPersonData,
  type PeopleDataLabsPersonEnrichParams,
} from 'twenty-shared/people-data-labs';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichPeople = (
  params: PeopleDataLabsPersonEnrichParams[],
): Promise<PeopleDataLabsEnrichResult<PeopleDataLabsPersonData>[]> =>
  postPdlBulkEnrich<PeopleDataLabsPersonData>({
    path: '/person/bulk',
    requests: params.map((entry) =>
      pruneUndefined({
        pdl_id: entry.pdlId,
        profile: entry.profile,
        email: entry.email,
        name: entry.name,
        company: entry.company,
        min_likelihood: entry.minLikelihood,
      }),
    ),
  });
