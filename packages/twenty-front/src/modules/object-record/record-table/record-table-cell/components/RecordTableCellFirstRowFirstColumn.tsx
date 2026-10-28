import { RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableRowBackgroundCssVariableName';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRecordTableTd = styled.div<{
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
}>`
  background: var(
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME},
    ${themeCssVariables.background.primary}
  );

  border-bottom: 1px solid
    ${({ hasBottomBorder }) =>
      hasBottomBorder ? themeCssVariables.border.color.light : 'transparent'};
  border-right: ${({ hasRightBorder }) =>
    hasRightBorder
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};

  color: ${themeCssVariables.font.color.primary};
  font-variant-numeric: tabular-nums;

  padding: 0;

  text-align: left;
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};

  z-index: ${TABLE_Z_INDEX.cell.sticky};

  &[data-selected] {
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME}: ${
      themeCssVariables.accent.tertiary
    };
  }

  &[data-dragging] {
    background: transparent;
    border-bottom-color: transparent;
  }
`;

export const RecordTableCellFirstRowFirstColumn = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
}: {
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
}) => {
  return (
    <StyledRecordTableTd
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      className={cx(
        'table-cell-0-0',
        getRecordTableColumnFieldWidthClassName(0),
      )}
    >
      {children}
    </StyledRecordTableTd>
  );
};
