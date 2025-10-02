import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { IconCopy, IconPencil, IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledDropdownWrapper = styled.div`
  display: flex;
`;

type TabActionsDropdownProps = {
  dropdownId: string;
  clickableComponent: ReactNode;
  onRename: () => void;
  onDuplicateLeft: () => void;
  onDuplicateRight: () => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
};

export const TabActionsDropdown = ({
  dropdownId,
  clickableComponent,
  onRename,
  onDuplicateLeft,
  onDuplicateRight,
  onDelete,
  isDeleteDisabled,
}: TabActionsDropdownProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleRename = () => {
    onRename();
    closeDropdown(dropdownId);
  };

  const handleDuplicateLeft = () => {
    onDuplicateLeft();
    closeDropdown(dropdownId);
  };

  const handleDuplicateRight = () => {
    onDuplicateRight();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  return (
    <StyledDropdownWrapper>
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        clickableComponent={clickableComponent}
        dropdownComponents={
          <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
            <DropdownMenuItemsContainer>
              <MenuItem
                text="Rename"
                LeftIcon={IconPencil}
                onClick={handleRename}
              />
              <MenuItem
                text="Duplicate Left"
                LeftIcon={IconCopy}
                onClick={handleDuplicateLeft}
              />
              <MenuItem
                text="Duplicate Right"
                LeftIcon={IconCopy}
                onClick={handleDuplicateRight}
              />
              <MenuItem
                text="Delete"
                accent="danger"
                LeftIcon={IconTrash}
                onClick={handleDelete}
                disabled={isDeleteDisabled}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </StyledDropdownWrapper>
  );
};
