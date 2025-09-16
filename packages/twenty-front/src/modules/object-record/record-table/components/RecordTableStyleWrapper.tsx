import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTable = styled.div<{
  isDragging?: boolean;
  visibleRecordFields: RecordField[];
  lastColumnWidth: number;
}>`
  & > * {
    pointer-events: ${({ isDragging }) =>
      isDragging === true ? 'none' : 'auto'};
  }

  display: flex;
  flex-wrap: wrap;
  width: 100%;

  div.header-cell {
    position: sticky;
    top: 0;
  }

  div.header-cell:nth-of-type(n + 5) {
    z-index: ${TABLE_Z_INDEX.headerColumnsNormal};
  }

  div.header-cell:nth-of-type(1) {
    left: 0px;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(2) {
    left: 16px;
    top: 0;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(3) {
    left: 48px;
    right: 0;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};

    // &::after {
    //   content: '';
    //   position: absolute;
    //   top: -1px;
    //   height: calc(100% + 2px);
    //   width: 4px;
    //   right: 0px;
    //   box-shadow: ${({ theme }) => theme.boxShadow.light};
    //   clip-path: inset(0px -4px 0px 0px);
    // }

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
      max-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
      min-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
    }
  }

  div.table-cell:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell:nth-of-type(2) {
    position: sticky;
    left: 16px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell-0-0 {
    position: sticky;
    left: 48px;
  }

  div.table-cell:nth-of-type(3) {
    position: sticky;
    left: 48px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    max-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  }

  div.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
    max-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  }

  div.${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME} {
    width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
    max-width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
  }

  ${({ visibleRecordFields, lastColumnWidth }) => {
    let returnedCSS = '';

    for (let i = 0; i < visibleRecordFields.length; i++) {
      returnedCSS += `--record-table-column-field-${i}: ${visibleRecordFields[i].size}px; \n`;
    }

    for (let i = 0; i < visibleRecordFields.length; i++) {
      returnedCSS += `div.${getRecordTableColumnFieldWidthClassName(i)} { 
        width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)}); 
        min-width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)}); 
        max-width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)}); 
      } \n`;

      const isLabelIdentifierColumn = i === 0;

      if (isLabelIdentifierColumn) {
        returnedCSS += `div.${getRecordTableColumnFieldWidthClassName(i)} { 
          @media (max-width: ${MOBILE_VIEWPORT}px) {
            width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
            max-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
            min-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
          }
        } \n`;
      }
    }

    returnedCSS += `${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}: ${lastColumnWidth}px;`;

    return returnedCSS;
  }};

  div.${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME} {
    width: var(${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME});
    min-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    max-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
  }
`;

export const RecordTableStyleWrapper = StyledTable;
