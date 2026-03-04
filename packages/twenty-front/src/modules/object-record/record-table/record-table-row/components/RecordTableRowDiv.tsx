import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTr = styled.div<{
  isDragging: boolean;
  isFirstRowOfGroup?: boolean;
  isScrolledVertically?: boolean;
}>`
  --z-index-for-sticky-cells: ${({
    isFirstRowOfGroup,
    isScrolledVertically,
  }) =>
    isFirstRowOfGroup === true
      ? isScrolledVertically
        ? TABLE_Z_INDEX.activeRows.firstRow.sticky.scrolledVertically
        : TABLE_Z_INDEX.activeRows.firstRow.sticky.noVerticalScroll
      : isScrolledVertically
        ? TABLE_Z_INDEX.activeRows.afterFirstRow.sticky.scrolledVertically
        : TABLE_Z_INDEX.activeRows.afterFirstRow.sticky.noVerticalScroll};

  --z-index-for-normal-cells: ${({
    isFirstRowOfGroup,
    isScrolledVertically,
  }) =>
    isFirstRowOfGroup === true
      ? isScrolledVertically
        ? TABLE_Z_INDEX.activeRows.firstRow.normal.scrolledVertically
        : TABLE_Z_INDEX.activeRows.firstRow.normal.noVerticalScroll
      : isScrolledVertically
        ? TABLE_Z_INDEX.activeRows.afterFirstRow.normal.scrolledVertically
        : TABLE_Z_INDEX.activeRows.afterFirstRow.normal.noVerticalScroll};

  border-top: ${({ isDragging }) =>
    isDragging ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};

  display: flex;
  flex-direction: row;

  &[data-focused='true'],
  &[data-active='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${themeCssVariables.border.color.medium};
        border-color: ${themeCssVariables.border.color.medium};
        background-color: ${themeCssVariables.background.tertiary};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${themeCssVariables.border.color.medium};

        margin-left: -1px;

        div {
          margin-left: -1px;
        }
      }
      &:last-of-type {
        border-right: 1px solid ${themeCssVariables.border.color.medium};
        border-radius: 0 ${themeCssVariables.border.radius.sm}
          ${themeCssVariables.border.radius.sm} 0;
      }
    }
  }
`;

export const RecordTableRowDiv = StyledTr;
