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
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

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
  const siblings = useWorkspaceNavigationMenuContainers({ type, containerId });
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
