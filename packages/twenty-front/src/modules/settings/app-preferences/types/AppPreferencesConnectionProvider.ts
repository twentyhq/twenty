import { type ApplicationConnectionProvidersQuery } from '~/generated-metadata/graphql';

export type AppPreferencesConnectionProvider =
  ApplicationConnectionProvidersQuery['applicationConnectionProviders'][number];
