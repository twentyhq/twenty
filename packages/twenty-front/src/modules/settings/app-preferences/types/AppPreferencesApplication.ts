import { type MyAppPreferencesApplicationsQuery } from '~/generated-metadata/graphql';

export type AppPreferencesApplication =
  MyAppPreferencesApplicationsQuery['myAppPreferencesApplications'][number];
