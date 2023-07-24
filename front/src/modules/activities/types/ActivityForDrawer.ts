import { GetActivitiesByTargetsQuery } from '~/generated/graphql';

export type ActivityForDrawer =
  GetActivitiesByTargetsQuery['findManyActivities'][0];
