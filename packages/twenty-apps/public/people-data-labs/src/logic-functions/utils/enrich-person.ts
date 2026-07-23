import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';
import {
  type PeopleDataLabsEnrichResult,
  type PeopleDataLabsPersonData,
  type PeopleDataLabsPersonEnrichParams,
} from 'twenty-shared/people-data-labs';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichPerson = (
  params: PeopleDataLabsPersonEnrichParams[],
): Promise<PeopleDataLabsEnrichResult<PeopleDataLabsPersonData>[]> =>
  Promise.all(
    params.map((entry) =>
      postPdlSingleEnrich<PeopleDataLabsPersonData>({
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
