import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import styled from '@emotion/styled';

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

  border-top: ${({ isDragging, theme }) =>
    isDragging ? `1px solid ${theme.border.color.medium}` : 'none'};

  display: flex;
  flex-direction: row;

  &[data-next-row-active-or-focused='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      border-bottom: none;
    }
  }

  &[data-focused='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
        border-top: 1px solid ${({ theme }) => theme.border.color.medium};
        border-color: ${({ theme }) => theme.border.color.medium};
        background-color: ${({ theme }) => theme.background.tertiary};
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${({ theme }) => theme.border.color.medium};
        border-radius: ${({ theme }) => theme.border.radius.sm} 0 0
          ${({ theme }) => theme.border.radius.sm};

        margin-left: -1px;

        div {
          margin-left: -1px;
        }
      }
      &:last-of-type {
        border-right: 1px solid ${({ theme }) => theme.border.color.medium};
        border-radius: 0 ${({ theme }) => theme.border.radius.sm}
          ${({ theme }) => theme.border.radius.sm} 0;
      }
    }
  }

  &[data-active='true'] {
    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-top: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        background-color: ${({ theme }) => theme.accent.quaternary};

        z-index: var(--z-index-for-normal-cells);
      }
      &:nth-of-type(2) {
        border-left: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-radius: ${({ theme }) => theme.border.radius.sm} 0 0
          ${({ theme }) => theme.border.radius.sm};

        margin-left: -1px;

        div {
          margin-left: -1px;
        }

        z-index: var(--z-index-for-sticky-cells);
      }
      &:nth-of-type(3) {
        z-index: var(--z-index-for-sticky-cells);
      }
      &:nth-of-type(1) {
        z-index: var(--z-index-for-sticky-cells);
      }
      &:last-of-type {
        border-right: 1px solid ${({ theme }) => theme.adaptiveColors.blue3};
        border-radius: 0 ${({ theme }) => theme.border.radius.sm}
          ${({ theme }) => theme.border.radius.sm} 0;
        z-index: var(--z-index-for-normal-cells);
      }
    }
  }
`;

export const RecordTableRowDiv = StyledTr;
