import { CheckUserExistOutput } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const availableSSOIdentityProvidersForAuthState = createState<
  CheckUserExistOutput['availableWorkspaces'][0]['sso']
>({
  key: 'availableSSOIdentityProvidersForAuth',
  defaultValue: [],
});
