import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsState = createAtomState<NavigationMenuItem[]>({
  key: 'navigationMenuItemsState',
  defaultValue: [],
});
