import { UserExists } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const availableSSOIdentityProvidersForAuthState = createState<
  NonNullable<UserExists['availableWorkspaces']>[0]['sso']
>({
  key: 'availableSSOIdentityProvidersForAuth',
  defaultValue: [],
});
