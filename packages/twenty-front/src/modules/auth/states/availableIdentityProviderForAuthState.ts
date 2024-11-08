import { createState } from 'twenty-ui';
import { FindAvailableWorkspacesByEmailQuery } from '~/generated/graphql';

export const availableSSOIdentityProvidersForAuthState = createState<Omit<
  FindAvailableWorkspacesByEmailQuery['findAvailableWorkspacesByEmail'][0]['sso'],
  '__typename'
> | null>({
  key: 'availableSSOIdentityProvidersForAuth',
  defaultValue: [],
});
