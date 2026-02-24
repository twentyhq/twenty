/* @license Enterprise */

import { type SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const SSOIdentitiesProvidersState = createStateV2<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
