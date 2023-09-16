import { useRef } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconEyeOff,
} from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useTableColumns } from '../hooks/useTableColumns';
import { selectedTableColumnHeaderState } from '../states/selectedTableColumnHeaderState';
import { ColumnDefinition } from '../types/ColumnDefinition';

const StyledDropdownContainer = styled.div`
  left: 0px;
  position: absolute;
  top: 32px;
  z-index: 1;
`;
type OwnProps = {
  column: ColumnDefinition<ViewFieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
};
export const EntityTableHeaderOptions = ({
  column,
  isFirstColumn,
  isLastColumn,
}: OwnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setSelectedTableColumnHeader = useSetRecoilState(
    selectedTableColumnHeaderState,
  );

  const {
    handleColumnVisibilityChange,
    handleColumnMoveLeftChange,
    handleColumnMoveRightChange,
  } = useTableColumns();

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Clicked outside of the component, so hide it
        setSelectedTableColumnHeader('');
      }
    },
  });

  const handleColumnMoveLeft = () => {
    setSelectedTableColumnHeader('');
    if (isFirstColumn) return;
    else handleColumnMoveLeftChange(column);
  };

  const handleColumnMoveRight = () => {
    setSelectedTableColumnHeader('');
    if (isLastColumn) return;
    else handleColumnMoveRightChange(column);
  };

  const handleColumnVisibility = () => {
    handleColumnVisibilityChange(column);
  };

  return (
    <StyledDropdownContainer>
      <StyledDropdownMenu ref={containerRef}>
        <StyledDropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconArrowNarrowLeft}
            onClick={handleColumnMoveLeft}
            text="Move left"
          />
          <MenuItem
            LeftIcon={IconArrowNarrowRight}
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
    </StyledDropdownContainer>
  );
};
