import { createState } from 'twenty-ui';
import { FindAvailableSsoIdentityProvidersMutationResult } from '~/generated/graphql';

export const availableSSOIdentityProvidersState = createState<
  NonNullable<
    FindAvailableSsoIdentityProvidersMutationResult['data']
  >['findAvailableSSOIdentityProviders']
>({
  key: 'availableSSOIdentityProviders',
  defaultValue: [],
});
