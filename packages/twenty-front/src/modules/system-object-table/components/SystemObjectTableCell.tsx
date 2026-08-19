import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SYSTEM_OBJECT_TABLE_ROW_HEIGHT } from '@/system-object-table/constants/SystemObjectTableRowHeight';
import { type SystemObjectTableColumnAlign } from '@/system-object-table/types/SystemObjectTableColumn';

const StyledCell = styled.div<{
  columnWidth: number | undefined;
  align: SystemObjectTableColumnAlign;
}>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: ${({ columnWidth }) =>
    columnWidth === undefined ? '1 1 0' : `0 0 ${columnWidth}px`};
  gap: ${themeCssVariables.spacing[1]};
  height: ${SYSTEM_OBJECT_TABLE_ROW_HEIGHT}px;
  justify-content: ${({ align }) =>
    align === 'right' ? 'flex-end' : 'flex-start'};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SystemObjectTableCell = ({
  children,
  columnWidth,
  align = 'left',
}: {
  children: ReactNode;
  columnWidth?: number;
  align?: SystemObjectTableColumnAlign;
}) => (
  <StyledCell columnWidth={columnWidth} align={align}>
    {children}
  </StyledCell>
);
