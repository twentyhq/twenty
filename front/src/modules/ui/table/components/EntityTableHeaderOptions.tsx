import styled from '@emotion/styled';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ColumnHeadDropdownId } from '../constants/ColumnHeadDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

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
  const {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
  } = useTableColumns();

  const { closeDropdownButton } = useDropdownButton({
    dropdownId: ColumnHeadDropdownId,
  });

  const handleColumnMoveLeft = () => {
    closeDropdownButton();
    if (isFirstColumn) {
      return;
    }
    handleColumnLeftMove(column);
  };

  const handleColumnMoveRight = () => {
    closeDropdownButton();
    if (isLastColumn) {
      return;
    }
    handleColumnRightMove(column);
  };

  const handleColumnVisibility = () => {
    handleColumnVisibilityChange(column);
  };

  return (
    <StyledDropdownContainer>
      <DropdownButton
        dropdownId={ColumnHeadDropdownId}
        dropdownComponents={
          <StyledDropdownMenu>
            <StyledDropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconArrowLeft}
                onClick={handleColumnMoveLeft}
                text="Move left"
              />
              <MenuItem
                LeftIcon={IconArrowRight}
                onClick={handleColumnMoveRight}
                text="Move right"
              />
              <MenuItem
                LeftIcon={IconEyeOff}
                onClick={handleColumnVisibility}
                text="Hide"
              />
            </StyledDropdownMenuItemsContainer>
          </StyledDropdownMenu>
        }
        dropdownHotkeyScope={{ scope: TableHotkeyScope.Table }}
      />
    </StyledDropdownContainer>
  );
};
