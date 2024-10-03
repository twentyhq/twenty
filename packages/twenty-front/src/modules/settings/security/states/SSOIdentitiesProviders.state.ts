import { createState } from 'twenty-ui';
import { SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';

export const SSOIdentitiesProvidersState = createState<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
