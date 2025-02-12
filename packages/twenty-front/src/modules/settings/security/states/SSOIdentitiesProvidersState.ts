/* @license Enterprise */

import { SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { createState } from '@ui/utilities/state/utils/createState';

export const SSOIdentitiesProvidersState = createState<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
