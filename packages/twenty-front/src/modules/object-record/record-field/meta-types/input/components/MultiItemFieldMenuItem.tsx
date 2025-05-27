import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import React, { useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
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
  DisplayComponent: React.ComponentType<{ value: T }>;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
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
}: MultiItemFieldMenuItemProps<T>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDropdownOpen, closeDropdown } = useDropdown(dropdownId);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown();
    setIsHovered(false);
    onDelete?.();
  };

  const handleSetAsPrimaryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown();
    onSetAsPrimary?.();
  };

  const handleEditClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown();
    onEdit?.();
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
                text="Set as Primary"
                onClick={handleSetAsPrimaryClick}
              />
            )}
            <MenuItem
              LeftIcon={IconPencil}
              text="Edit"
              onClick={handleEditClick}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text="Delete"
              onClick={handleDeleteClick}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
