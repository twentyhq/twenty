/* @license Enterprise */

import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const ssoIdentitiesProvidersState = createAtomState<
  Omit<SsoIdentityProvider, '__typename'>[]
>({
  key: 'ssoIdentitiesProvidersState',
  defaultValue: [],
});
