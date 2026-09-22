import { t } from '@lingui/core/macro';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React, { useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconCopy,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Menu } from 'twenty-ui/primitives/surfaces';

type MultiItemFieldMenuItemProps<T> = {
  dropdownId: string;
  value: T;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: (value: T) => void;
  onClick?: () => void;
  DisplayComponent: React.ComponentType<{ value: T }>;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
  showCopyButton?: boolean;
};

export const MultiItemFieldMenuItem = <T,>({
  dropdownId,
  value,
  onEdit,
  onSetAsPrimary,
  onDelete,
  onClick,
  DisplayComponent,
  showPrimaryIcon,
  showSetAsPrimaryButton,
  showCopyButton,
  onCopy,
}: MultiItemFieldMenuItemProps<T>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { closeDropdown } = useCloseDropdown();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDeleteClick = () => {
    closeDropdown(dropdownId);
    setIsHovered(false);
    onDelete?.();
  };

  const handleSetAsPrimaryClick = () => {
    closeDropdown(dropdownId);
    onSetAsPrimary?.();
  };

  const handleEditClick = () => {
    closeDropdown(dropdownId);
    onEdit?.();
  };

  const handleCopyClick = () => {
    closeDropdown(dropdownId);
    onCopy?.(value);
  };

  return (
    <MenuItemWithOptionDropdown
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      text={<DisplayComponent value={value} />}
      isIconDisplayedOnHoverOnly={!showPrimaryIcon && !isDropdownOpen}
      RightIcon={!isHovered && showPrimaryIcon ? IconBookmark : null}
      dropdownId={dropdownId}
      dropdownContent={
        <DropdownContent>
          <Menu.Group>
            {showSetAsPrimaryButton && (
              <Menu.Item
                startIcon={<IconBookmarkPlus />}
                onClick={handleSetAsPrimaryClick}
              >{t`Set as Primary`}</Menu.Item>
            )}
            <Menu.Item
              startIcon={<IconPencil />}
              onClick={handleEditClick}
            >{t`Edit`}</Menu.Item>
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDeleteClick}
            >{t`Delete`}</Menu.Item>
            {showCopyButton && (
              <Menu.Item
                startIcon={<IconCopy />}
                onClick={handleCopyClick}
              >{t`Copy`}</Menu.Item>
            )}
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
