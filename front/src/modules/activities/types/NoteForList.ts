import { GetActivitiesQuery } from '~/generated/graphql';

export type NoteForList = GetActivitiesQuery['findManyActivities'][0];
