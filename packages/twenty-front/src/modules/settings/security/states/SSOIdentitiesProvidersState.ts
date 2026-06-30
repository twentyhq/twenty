/* @license Enterprise */

import { type SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const SSOIdentitiesProvidersState = createAtomState<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
