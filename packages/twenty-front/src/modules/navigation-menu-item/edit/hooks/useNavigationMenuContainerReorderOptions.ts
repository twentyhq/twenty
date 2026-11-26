import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from 'twenty-ui/icon';

import { getNavigationMenuItemMovedPosition } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMovedPosition';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const getNavigationMenuContainerChildrenInPositionOrder = <
  TItem extends Pick<NavigationMenuItem, 'parentId' | 'type' | 'position'>,
>({
  items,
  containerId,
}: {
  items: TItem[];
  containerId: string | null;
}): TItem[] => {
  const children = items.filter(
    (item) =>
      (item.parentId ?? null) === containerId &&
      item.type !== NavigationMenuItemType.TAB,
  );

  return sortNavigationMenuContainerChildren({
    items: children.filter(
      (child) => child.type !== NavigationMenuItemType.SECTION,
    ),
    sections: children.filter(
      (child) => child.type === NavigationMenuItemType.SECTION,
    ),
  });
};

export const useNavigationMenuContainerReorderOptions = ({
  itemId,
  type,
  containerId,
  onMoved,
}: {
  itemId: string;
  type: NavigationMenuItemType.TAB | NavigationMenuItemType.SECTION;
  containerId: string | null;
  onMoved: () => void;
}): NavigationMenuItemOption[] => {
  const { t } = useLingui();
  const containers = useWorkspaceNavigationMenuContainers({
    type,
    containerId,
  });
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const siblings =
    type === NavigationMenuItemType.SECTION
      ? getNavigationMenuContainerChildrenInPositionOrder({
          items: workspaceNavigationMenuItems,
          containerId,
        })
      : containers;
  const { updateItem } = useNavigationMenuItemEditController('workspace');
  const isHorizontal = type === NavigationMenuItemType.TAB;

  const labels = isHorizontal
    ? { [-1]: t`Move left`, 1: t`Move right` }
    : { [-1]: t`Move up`, 1: t`Move down` };
  const icons = isHorizontal
    ? { [-1]: IconChevronLeft, 1: IconChevronRight }
    : { [-1]: IconChevronUp, 1: IconChevronDown };

  const buildOption = (offset: -1 | 1): NavigationMenuItemOption => {
    const position = getNavigationMenuItemMovedPosition({
      siblings,
      itemId,
      offset,
    });

    return {
      id: offset === -1 ? 'up' : 'down',
      label: labels[offset],
      Icon: icons[offset],
      isDisabled: !isDefined(position),
      onClick: () => {
        if (isDefined(position)) {
          void updateItem(itemId, { position });
        }
        onMoved();
      },
    };
  };

  return [buildOption(-1), buildOption(1)];
};
