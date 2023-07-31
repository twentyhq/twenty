import { GetActivitiesByTypeQuery } from '~/generated/graphql';

export type TaskForList = GetActivitiesByTypeQuery['findManyActivities'][0];
