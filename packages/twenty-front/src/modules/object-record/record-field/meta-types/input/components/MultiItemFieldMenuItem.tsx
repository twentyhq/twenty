import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import React, { useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconCopy,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type MultiItemFieldMenuItemProps<T> = {
  dropdownId: string;
  value: T;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
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
}: MultiItemFieldMenuItemProps<T>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { closeDropdown } = useCloseDropdown();
  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { copyToClipboard } = useCopyToClipboard();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown(dropdownId);
    setIsHovered(false);
    onDelete?.();
  };

  const handleSetAsPrimaryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown(dropdownId);
    onSetAsPrimary?.();
  };

  const handleEditClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    closeDropdown(dropdownId);
    onEdit?.();
  };

  const handleCopyClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();

    copyToClipboard(String(value));
    closeDropdown(dropdownId);
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
            {showCopyButton && (
              <MenuItem
                LeftIcon={IconCopy}
                text="Copy"
                onClick={handleCopyClick}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
