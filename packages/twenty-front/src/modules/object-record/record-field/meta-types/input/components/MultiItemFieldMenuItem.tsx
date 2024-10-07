import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconComponent,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from 'twenty-ui';

type MultiItemFieldMenuItemProps<T> = {
  dropdownId: string;
  isPrimary?: boolean;
  value: T;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  DisplayComponent: React.ComponentType<{ value: T }>;
  hasPrimaryButton?: boolean;
};

const StyledIconBookmark = styled(IconBookmark)`
  color: ${({ theme }) => theme.font.color.light};
  height: ${({ theme }) => theme.icon.size.sm}px;
  width: ${({ theme }) => theme.icon.size.sm}px;
`;

export const MultiItemFieldMenuItem = <T,>({
  dropdownId,
  isPrimary,
  value,
  onEdit,
  onSetAsPrimary,
  onDelete,
  DisplayComponent,
  hasPrimaryButton = true,
}: MultiItemFieldMenuItemProps<T>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDropdownOpen, closeDropdown } = useDropdown(dropdownId);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleDeleteClick = () => {
    setIsHovered(false);
    onDelete?.();
  };

  useEffect(() => {
    if (isDropdownOpen) {
      return () => closeDropdown();
    }
  }, [closeDropdown, isDropdownOpen]);

  return (
    <MenuItem
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      text={<DisplayComponent value={value} />}
      isIconDisplayedOnHoverOnly={!isPrimary && !isDropdownOpen}
      iconButtons={[
        {
          Wrapper: isHovered
            ? ({ iconButton }) => (
                <Dropdown
                  dropdownId={dropdownId}
                  dropdownHotkeyScope={{ scope: dropdownId }}
                  dropdownPlacement="right-start"
                  dropdownStrategy="fixed"
                  disableBlur
                  clickableComponent={iconButton}
                  dropdownComponents={
                    <DropdownMenuItemsContainer>
                      {hasPrimaryButton && !isPrimary && (
                        <MenuItem
                          LeftIcon={IconBookmarkPlus}
                          text="Set as Primary"
                          onClick={onSetAsPrimary}
                        />
                      )}
                      <MenuItem
                        LeftIcon={IconPencil}
                        text="Edit"
                        onClick={onEdit}
                      />
                      <MenuItem
                        accent="danger"
                        LeftIcon={IconTrash}
                        text="Delete"
                        onClick={handleDeleteClick}
                      />
                    </DropdownMenuItemsContainer>
                  }
                />
              )
            : undefined,
          Icon:
            isPrimary && !isHovered
              ? (StyledIconBookmark as IconComponent)
              : IconDotsVertical,
          accent: 'tertiary',
          onClick: isHovered ? () => {} : undefined,
        },
      ]}
    />
  );
};
