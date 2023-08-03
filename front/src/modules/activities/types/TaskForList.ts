import { GetActivitiesQuery } from '~/generated/graphql';

export type TaskForList = GetActivitiesQuery['findManyActivities'][0];
