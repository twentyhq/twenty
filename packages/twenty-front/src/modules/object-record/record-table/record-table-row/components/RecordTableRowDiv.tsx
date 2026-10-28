import { RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableRowBackgroundCssVariableName';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Cells and the hover/focus portals mounted inside them read the row background
// from this variable, so the tint stays opaque over sticky columns.
const StyledTr = styled.div<{
  isDragging: boolean;
}>`
  border-bottom: ${({ isDragging }) =>
    isDragging ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};
  border-top: ${({ isDragging }) =>
    isDragging ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};

  display: flex;
  flex-direction: row;

  position: relative;

  @media (hover: hover) {
    &:hover {
      ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME}: ${
        themeCssVariables.background.secondary
      };
    }
  }

  &[data-focused='true'],
  &[data-active='true'] {
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME}: ${
      themeCssVariables.accent.quaternary
    };

    div.table-cell,
    div.table-cell-0-0 {
      &:not(:first-of-type) {
        border-bottom: 1px solid ${themeCssVariables.border.color.medium};
        border-color: ${themeCssVariables.border.color.medium};
      }
      &:nth-of-type(2) {
        box-shadow: inset 1px 0 0 ${themeCssVariables.border.color.medium};
      }
      &:last-of-type {
        border-radius: 0 ${themeCssVariables.border.radius.sm}
          ${themeCssVariables.border.radius.sm} 0;
        border-right: 1px solid ${themeCssVariables.border.color.medium};
      }
    }
  }
`;

export const RecordTableRowDiv = StyledTr;
