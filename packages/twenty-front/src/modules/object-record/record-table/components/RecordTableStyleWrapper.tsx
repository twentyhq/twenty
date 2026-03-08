import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { HorizontalScrollBoxShadowCSS } from '@/object-record/record-table/components/HorizontalScrollBoxShadowCSS';
import { VerticalScrollBoxShadowCSS } from '@/object-record/record-table/components/VerticalScrollBoxShadowCSS';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthClassName';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export { HorizontalScrollBoxShadowCSS, VerticalScrollBoxShadowCSS };

const MAX_COLUMNS = 100;

const columnFieldWidthRules = Array.from(
  { length: MAX_COLUMNS },
  (_, i) =>
    `div.${getRecordTableColumnFieldWidthClassName(i)} {
    width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)});
    min-width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)});
    max-width: var(${getRecordTableColumnFieldWidthCSSVariableName(i)});
  }`,
).join('\n');

export const getRecordTableColumnWidthInlineStyles = (
  visibleRecordFields: RecordField[],
): Record<string, string> => {
  const style: Record<string, string> = {};
  for (let i = 0; i < visibleRecordFields.length; i++) {
    style[`--record-table-column-field-${i}`] =
      `${visibleRecordFields[i].size}px`;
  }
  return style;
};

const StyledTable = styled.div<{
  isDragging?: boolean;
  hasRecordGroups: boolean;
}>`
  & > * {
    pointer-events: ${({ isDragging }) =>
      isDragging === true ? 'none' : 'auto'};
  }

  display: flex;
  flex-wrap: wrap;
  position: relative;

  width: 100%;

  div.header-cell {
    position: sticky;
    top: 0;

    ${VerticalScrollBoxShadowCSS}
  }

  div.header-cell:nth-of-type(n + 5) {
    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.headerColumns.withGroups.headerColumnsNormal
        : TABLE_Z_INDEX.headerColumns.withoutGroups.headerColumnsNormal};
  }

  div.header-cell:nth-of-type(1) {
    background-color: ${themeCssVariables.background.primary};

    left: 0px;

    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.headerColumns.withGroups.headerColumnsSticky
        : TABLE_Z_INDEX.headerColumns.withoutGroups.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(2) {
    background-color: ${themeCssVariables.background.primary};
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

    top: 0;

    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.headerColumns.withGroups.headerColumnsSticky
        : TABLE_Z_INDEX.headerColumns.withoutGroups.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(3) {
    background-color: ${themeCssVariables.background.primary};
    left: ${`${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`};

    right: 0;

    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.headerColumns.withGroups.headerColumnsSticky
        : TABLE_Z_INDEX.headerColumns.withoutGroups.headerColumnsSticky};

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell:nth-of-type(1) {
    left: 0px;
    position: sticky;
    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.cell.withGroups.sticky
        : TABLE_Z_INDEX.cell.withoutGroups.sticky};
  }

  div.table-cell:nth-of-type(2) {
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    position: sticky;
    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.cell.withGroups.sticky
        : TABLE_Z_INDEX.cell.withoutGroups.sticky};
  }

  div.table-cell-0-0 {
    left: ${`${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`};
    position: sticky;

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell:nth-of-type(3) {
    left: ${`${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`};
    position: sticky;
    z-index: ${({ hasRecordGroups }) =>
      hasRecordGroups
        ? TABLE_Z_INDEX.cell.withGroups.sticky
        : TABLE_Z_INDEX.cell.withoutGroups.sticky};

    ${HorizontalScrollBoxShadowCSS}
  }

  div.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    max-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  }

  div.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    max-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
    width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  }

  div.${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME} {
    max-width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
    min-width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
    width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
  }

  ${columnFieldWidthRules}

  div.${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME} {
    max-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    min-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    width: var(${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME});
  }

  div.${RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME} {
    max-width: var(
      ${RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    min-width: var(
      ${RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    width: var(
      ${RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
  }
`;

export const RecordTableStyleWrapper = StyledTable;
