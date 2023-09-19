import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconEyeOff,
} from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ColumnHeaderDropdownId } from '../constants/ColumnHeaderDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

const StyledDropdownContainer = styled.div`
  left: 0px;
  position: absolute;
  top: 32px;
  z-index: 1;
`;
type EntityTableHeaderOptionsProps = {
  column: ColumnDefinition<ViewFieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
};
export const EntityTableHeaderOptions = ({
  column,
  isFirstColumn,
  isLastColumn,
}: EntityTableHeaderOptionsProps) => {
  const theme = useTheme();

  const {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
  } = useTableColumns();

  const { closeDropdownButton } = useDropdownButton({
    dropdownId: ColumnHeaderDropdownId,
  });

  const handleColumnMoveLeft = () => {
    closeDropdownButton();
    if (isFirstColumn) return;
    else handleColumnLeftMove(column);
  };

  const handleColumnMoveRight = () => {
    closeDropdownButton();
    if (isLastColumn) return;
    else handleColumnRightMove(column);
  };

  const handleColumnVisibility = () => {
    handleColumnVisibilityChange(column);
  };

  return (
    <StyledDropdownContainer>
      <DropdownButton
        dropdownId={ColumnHeaderDropdownId}
        dropdownComponents={
          <StyledDropdownMenu>
            <StyledDropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={() => (
                  <IconArrowNarrowLeft size={theme.icon.size.md} />
                )}
                onClick={handleColumnMoveLeft}
                text="Move left"
              />
              <MenuItem
                LeftIcon={() => (
                  <IconArrowNarrowRight size={theme.icon.size.md} />
                )}
                onClick={handleColumnMoveRight}
                text="Move right"
              />
              <MenuItem
                LeftIcon={() => <IconEyeOff size={theme.icon.size.md} />}
                onClick={handleColumnVisibility}
                text="Hide"
              />
            </StyledDropdownMenuItemsContainer>
          </StyledDropdownMenu>
        }
      />
    </StyledDropdownContainer>
  );
};
