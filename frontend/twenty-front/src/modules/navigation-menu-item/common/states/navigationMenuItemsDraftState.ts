import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemsDraftState = createAtomState<
  NavigationMenuItem[] | null
>({
  key: 'navigationMenuItemsDraftState',
  defaultValue: null,
});
