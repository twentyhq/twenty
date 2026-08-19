import { styled } from '@linaria/react';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SYSTEM_OBJECT_TABLE_ROW_HEIGHT } from '@/system-object-table/constants/SystemObjectTableRowHeight';
import { type SystemObjectTableColumnAlign } from '@/system-object-table/types/SystemObjectTableColumn';
import { type SystemObjectTableSortDirection } from '@/system-object-table/types/SystemObjectTableSort';

const StyledHeaderCell = styled.div<{
  columnWidth: number | undefined;
  align: SystemObjectTableColumnAlign;
  isSortable: boolean;
}>`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isSortable }) => (isSortable ? 'pointer' : 'default')};
  display: flex;
  flex: ${({ columnWidth }) =>
    columnWidth === undefined ? '1 1 0' : `0 0 ${columnWidth}px`};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${SYSTEM_OBJECT_TABLE_ROW_HEIGHT}px;
  justify-content: ${({ align }) =>
    align === 'right' ? 'flex-end' : 'flex-start'};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  @media (hover: hover) {
    &:hover {
      background-color: ${({ isSortable }) =>
        isSortable
          ? themeCssVariables.background.transparent.light
          : themeCssVariables.background.primary};
    }
  }
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SystemObjectTableHeaderCell = ({
  label,
  columnWidth,
  align = 'left',
  sortDirection,
  onClick,
}: {
  label: string;
  columnWidth?: number;
  align?: SystemObjectTableColumnAlign;
  sortDirection?: SystemObjectTableSortDirection;
  onClick?: () => void;
}) => (
  <StyledHeaderCell
    columnWidth={columnWidth}
    align={align}
    isSortable={onClick !== undefined}
    onClick={onClick}
  >
    <StyledLabel>{label}</StyledLabel>
    {sortDirection === 'asc' && <IconArrowUp size={14} />}
    {sortDirection === 'desc' && <IconArrowDown size={14} />}
  </StyledHeaderCell>
);
