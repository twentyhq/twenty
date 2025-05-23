import { CheckUserExistOutput } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const availableSSOIdentityProvidersForAuthState = createState<
  CheckUserExistOutput['availableWorkspaces'][number]['sso']
>({
  key: 'availableSSOIdentityProvidersForAuth',
  defaultValue: [],
});
