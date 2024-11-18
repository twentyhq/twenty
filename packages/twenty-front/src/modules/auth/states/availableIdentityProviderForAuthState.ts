import { createState } from 'twenty-ui';
import { UserExists } from '~/generated/graphql';

export const availableSSOIdentityProvidersForAuthState = createState<
  NonNullable<UserExists['availableWorkspaces']>[0]['sso']
>({
  key: 'availableSSOIdentityProvidersForAuth',
  defaultValue: [],
});
