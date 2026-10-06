import { t } from '@lingui/core/macro';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import React, { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconCopy,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';

type MultiItemFieldMenuItemProps<TValue> = {
  dropdownId: string;
  value: TValue;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: (value: TValue) => void;
  onClick?: () => void;
  DisplayComponent: React.ComponentType<{ value: TValue }>;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
  showCopyButton?: boolean;
};

export const MultiItemFieldMenuItem = <TValue,>({
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
}: MultiItemFieldMenuItemProps<TValue>) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDeleteClick = () => {
    setIsHovered(false);
    onDelete?.();
  };

  const handleCopyClick = () => {
    onCopy?.(value);
  };

  return (
    <MenuItemWithOptionDropdown
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      text={<DisplayComponent value={value} />}
      isIconDisplayedOnHoverOnly={!showPrimaryIcon}
      RightIcon={!isHovered && showPrimaryIcon ? IconBookmark : null}
      dropdownId={dropdownId}
      dropdownContent={
        <Dropdown.Section>
          {showSetAsPrimaryButton && (
            <Dropdown.ActionItem
              startIcon={<IconBookmarkPlus />}
              onClick={onSetAsPrimary}
            >{t`Set as Primary`}</Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem
            startIcon={<IconPencil />}
            onClick={onEdit}
          >{t`Edit`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={handleDeleteClick}
          >{t`Delete`}</Dropdown.ActionItem>
          {showCopyButton && (
            <Dropdown.ActionItem
              startIcon={<IconCopy />}
              onClick={handleCopyClick}
            >{t`Copy`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      }
    />
  );
};
