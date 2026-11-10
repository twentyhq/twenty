import { type ApplicationConnectionProviderFragmentFragment } from '~/generated-metadata/graphql';

export type ConnectableApplicationConnectionProvider = Pick<
  ApplicationConnectionProviderFragmentFragment,
  'name' | 'displayName' | 'type'
>;
