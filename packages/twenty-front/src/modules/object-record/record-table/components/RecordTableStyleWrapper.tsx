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

export const RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR =
  '--record-table-drag-drop-width';
export const RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR =
  '--record-table-checkbox-width';

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

export const getRecordTableColumnWidthInlineStyles = ({
  visibleRecordFields,
  isDragColumnHidden,
  isCheckboxColumnHidden,
}: {
  visibleRecordFields: RecordField[];
  isDragColumnHidden?: boolean;
  isCheckboxColumnHidden?: boolean;
}): Record<string, string> => {
  const style: Record<string, string> = {};

  for (let i = 0; i < visibleRecordFields.length; i++) {
    style[`--record-table-column-field-${i}`] =
      `${visibleRecordFields[i].size}px`;
  }

  style[RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR] = isDragColumnHidden
    ? '0px'
    : `${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px`;

  style[RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR] = isCheckboxColumnHidden
    ? '0px'
    : `${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`;

  return style;
};

const StyledTable = styled.div<{
  isDragging?: boolean;
}>`
  & > * {
    pointer-events: ${({ isDragging }) =>
      isDragging === true ? 'none' : 'auto'};
  }

  display: flex;
  flex-direction: column;
  position: relative;

  width: 100%;

  div.header-cell {
    z-index: ${TABLE_Z_INDEX.headerColumns.headerColumnsNormal};
  }

  div.header-cell.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    background-color: ${themeCssVariables.background.primary};
    left: 0px;
    position: sticky;
    z-index: ${TABLE_Z_INDEX.headerColumns.headerColumnsSticky};
  }

  div.header-cell.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    background-color: ${themeCssVariables.background.primary};
    left: var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR});
    position: sticky;
    top: 0;
    z-index: ${TABLE_Z_INDEX.headerColumns.headerColumnsSticky};
  }

  div.header-cell.${getRecordTableColumnFieldWidthClassName(0)} {
    background-color: ${themeCssVariables.background.primary};
    left: calc(
      var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR}) +
        var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR})
    );
    position: sticky;
    right: 0;
    z-index: ${TABLE_Z_INDEX.headerColumns.headerColumnsSticky};

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    left: 0px;
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    left: var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR});
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell-0-0 {
    left: calc(
      var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR}) +
        var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR})
    );
    position: sticky;

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell.${getRecordTableColumnFieldWidthClassName(0)} {
    left: calc(
      var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR}) +
        var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR})
    );
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};

    ${HorizontalScrollBoxShadowCSS}
  }

  div.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    max-width: var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR});
    min-width: var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR});
    width: var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR});
  }

  div.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    max-width: var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR});
    min-width: var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR});
    width: var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR});
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
