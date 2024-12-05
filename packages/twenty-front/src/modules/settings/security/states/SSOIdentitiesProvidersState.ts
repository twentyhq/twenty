/* @license Enterprise */

import { SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { createState } from 'twenty-ui';

export const SSOIdentitiesProvidersState = createState<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
