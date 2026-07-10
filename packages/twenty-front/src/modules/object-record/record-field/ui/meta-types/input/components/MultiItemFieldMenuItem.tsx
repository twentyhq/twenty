import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React, { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconBookmark } from 'twenty-ui/icon';

import { MultiItemFieldMenuContent } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldMenuContent';

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
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDelete = () => {
    setIsHovered(false);
    onDelete?.();
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
          <DropdownMenuItemsContainer>
            <MultiItemFieldMenuContent
              dropdownId={dropdownId}
              onEdit={onEdit}
              onSetAsPrimary={onSetAsPrimary}
              onDelete={handleDelete}
              onCopy={isDefined(onCopy) ? () => onCopy(value) : undefined}
              showSetAsPrimaryButton={showSetAsPrimaryButton}
              showCopyButton={showCopyButton}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
