import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemsDraftStateV2 = createAtomState<
  NavigationMenuItem[] | null
>({
  key: 'navigationMenuItemsDraftStateV2',
  defaultValue: null,
});
