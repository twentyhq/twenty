import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
export const useIsNavigationMenuItemEditHighlighted = (
  item: Pick<NavigationMenuItem, 'id' | 'parentId'>,
): boolean =>
  useAtomStateValue(selectedNavigationMenuItemIdInEditModeState) === item.id;
