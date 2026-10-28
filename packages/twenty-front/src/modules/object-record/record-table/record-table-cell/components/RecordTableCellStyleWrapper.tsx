import { RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableRowBackgroundCssVariableName';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCell = styled.div`
  background: var(
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME},
    ${themeCssVariables.background.primary}
  );
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-variant-numeric: tabular-nums;
  padding: 0;
  text-align: left;
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};

  &[data-selected] {
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME}: ${
      themeCssVariables.accent.tertiary
    };
  }

  &[data-without-right-border] {
    border-right: none;
  }

  &[data-without-bottom-border] {
    border-bottom-color: transparent;
  }

  &[data-dragging] {
    background: transparent;
    border-bottom-color: transparent;
  }
`;

export const RecordTableCellStyleWrapper = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  widthClassName,
  ...divProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  widthClassName: string;
} & React.ComponentProps<'div'>) => {
  return (
    <StyledCell
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      data-without-right-border={!hasRightBorder || undefined}
      data-without-bottom-border={!hasBottomBorder || undefined}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...divProps}
      className={cx('table-cell', widthClassName)}
    >
      {children}
    </StyledCell>
  );
};
