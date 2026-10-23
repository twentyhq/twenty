import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';

export const getNavigationMenuItemPositionNextTo = ({
  sortedSiblings,
  navigationMenuItemId,
  targetNavigationMenuItemId,
}: {
  sortedSiblings: Pick<NavigationMenuItem, 'id' | 'position'>[];
  navigationMenuItemId: string;
  targetNavigationMenuItemId: string;
}): number | null => {
  const sourceIndex = sortedSiblings.findIndex(
    (sibling) => sibling.id === navigationMenuItemId,
  );
  const targetIndex = sortedSiblings.findIndex(
    (sibling) => sibling.id === targetNavigationMenuItemId,
  );

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return null;
  }

  const otherSiblings = sortedSiblings.filter(
    (sibling) => sibling.id !== navigationMenuItemId,
  );
  const targetIndexAmongOthers = otherSiblings.findIndex(
    (sibling) => sibling.id === targetNavigationMenuItemId,
  );
  const insertIndex =
    sourceIndex < targetIndex
      ? targetIndexAmongOthers + 1
      : targetIndexAmongOthers;

  return getPositionBetween(
    otherSiblings[insertIndex - 1]?.position,
    otherSiblings[insertIndex]?.position,
  );
};
