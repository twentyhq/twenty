import { t } from '@lingui/core/macro';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import React, { useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconCopy,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type MultiItemFieldMenuItemProps<T> = {
  dropdownId: string;
  value: T;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: (value: T) => void;
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
  DisplayComponent,
  showPrimaryIcon,
  showSetAsPrimaryButton,
  showCopyButton,
  onCopy,
}: MultiItemFieldMenuItemProps<T>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { closeDropdown } = useCloseDropdown();
  const isDropdownOpen = useRecoilComponentValue(
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
      text={<DisplayComponent value={value} />}
      isIconDisplayedOnHoverOnly={!showPrimaryIcon && !isDropdownOpen}
      RightIcon={!isHovered && showPrimaryIcon ? IconBookmark : null}
      dropdownId={dropdownId}
      dropdownContent={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {showSetAsPrimaryButton && (
              <MenuItem
                LeftIcon={IconBookmarkPlus}
                text={t`Set as Primary`}
                onClick={handleSetAsPrimaryClick}
              />
            )}
            <MenuItem
              LeftIcon={IconPencil}
              text={t`Edit`}
              onClick={handleEditClick}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={handleDeleteClick}
            />
            {showCopyButton && (
              <MenuItem
                LeftIcon={IconCopy}
                text={t`Copy`}
                onClick={handleCopyClick}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
