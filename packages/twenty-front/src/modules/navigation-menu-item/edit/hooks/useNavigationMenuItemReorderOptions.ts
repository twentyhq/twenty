import { useLingui } from '@lingui/react/macro';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from 'twenty-ui/icon';

import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

export const useNavigationMenuItemReorderOptions = ({
  navigationMenuItemId,
  section,
  isHorizontal = false,
  onClose,
}: {
  navigationMenuItemId: string;
  section: NavigationMenuItemSection;
  isHorizontal?: boolean;
  onClose: () => void;
}) => {
  const { t } = useLingui();
  const { getSortedSiblings, moveUp, moveDown } =
    useNavigationMenuItemMoveRemove(section);
  const siblings = getSortedSiblings(navigationMenuItemId) ?? [];
  const index = siblings.findIndex(
    (sibling) => sibling.id === navigationMenuItemId,
  );

  const reorderOptions: NavigationMenuItemOption[] = [
    {
      id: isHorizontal ? 'left' : 'up',
      label: isHorizontal ? t`Move left` : t`Move up`,
      Icon: isHorizontal ? IconChevronLeft : IconChevronUp,
      isDisabled: index <= 0,
      onClick: () => {
        void moveUp(navigationMenuItemId);
        onClose();
      },
    },
    {
      id: isHorizontal ? 'right' : 'down',
      label: isHorizontal ? t`Move right` : t`Move down`,
      Icon: isHorizontal ? IconChevronRight : IconChevronDown,
      isDisabled: index < 0 || index === siblings.length - 1,
      onClick: () => {
        void moveDown(navigationMenuItemId);
        onClose();
      },
    },
  ];

  return { reorderOptions, index };
};
