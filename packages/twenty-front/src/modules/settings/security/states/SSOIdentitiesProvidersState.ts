/* @license Enterprise */

import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const SsoIdentitiesProvidersState = createAtomState<
  Omit<SsoIdentityProvider, '__typename'>[]
>({
  key: 'SsoIdentitiesProvidersState',
  defaultValue: [],
});
