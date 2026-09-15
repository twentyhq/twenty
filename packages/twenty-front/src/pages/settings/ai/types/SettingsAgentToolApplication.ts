import { type FindManyApplicationsForToolTableQuery } from '~/generated-metadata/graphql';

export type SettingsAgentToolApplication =
  FindManyApplicationsForToolTableQuery['findManyApplications'][number];
