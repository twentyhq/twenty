import { type Draggable } from '@dnd-kit/dom';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { HorizontalScrollBoxShadowCSS } from '@/object-record/record-table/components/HorizontalScrollBoxShadowCSS';
import { getRecordTableColumnWidthInlineStyles } from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';

const MAX_COLUMNS = 100;

const cloneColumnFieldWidthRules = Array.from(
  { length: MAX_COLUMNS },
  (_, i) => {
    const className = getRecordTableColumnFieldWidthClassName(i);
    const cssVar = `var(--record-table-column-field-${i})`;
    const baseRule = `div.${className} {
    width: ${cssVar};
    min-width: ${cssVar};
    max-width: ${cssVar};
  }`;

    if (i === 0) {
      return `${baseRule}
  div.${className} {
    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
      max-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
      min-width: ${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px;
    }
  }`;
    }

    return baseRule;
  },
).join('\n');

// The overlay renders in a portal outside the table, so the column width CSS
// variables and sticky cell rules of the table ancestors are redeclared here.
const StyledRowDragOverlayCSSBridge = styled.div`
  div.table-cell.${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME} {
    left: 0px;
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell.${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME} {
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell-0-0 {
    left: ${`${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`};
    position: sticky;

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell.${getRecordTableColumnFieldWidthClassName(0)} {
    left: ${`${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`};
    position: sticky;
    z-index: ${TABLE_Z_INDEX.cell.sticky};

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

  ${cloneColumnFieldWidthRules}

  div.${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME} {
    max-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    min-width: var(
      ${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}
    );
    width: var(${RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME});
  }
`;

export const RecordTableRowDragOverlayContent = ({
  source,
}: {
  source: Draggable | null;
}) => {
  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const columnWidthStyles = useMemo(() => {
    const styles: Record<string, string> =
      getRecordTableColumnWidthInlineStyles({ visibleRecordFields });
    styles[RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME] =
      `${lastColumnWidth}px`;
    styles[
      RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME
    ] = `${lastColumnWidth}px`;
    return styles;
  }, [visibleRecordFields, lastColumnWidth]);

  const sourceData = source?.data as RecordTableRowDragData | undefined;

  if (!isDefined(source) || !isDefined(sourceData)) {
    return null;
  }

  const recordId = String(source.id);

  return (
    <StyledRowDragOverlayCSSBridge style={columnWidthStyles}>
      <RecordTableTr
        recordId={recordId}
        focusIndex={sourceData.focusIndex}
        style={{
          background: themeCssVariables.background.transparent.light,
          borderColor: themeCssVariables.border.color.medium,
        }}
        isDragging
        data-testid={`row-id-${recordId}`}
        data-selectable-id={recordId}
        onClick={() => {}}
      >
        <RecordTableRowDraggableContextProvider value={{ isDragging: true }}>
          <RecordTableCellDragAndDrop />
          <RecordTableCellCheckbox />
          <RecordTableFieldsCells />
          <RecordTablePlusButtonCellPlaceholder />
          <RecordTableLastEmptyCell />
          <RecordTableRowMultiDragPreview />
        </RecordTableRowDraggableContextProvider>
      </RecordTableTr>
    </StyledRowDragOverlayCSSBridge>
  );
};
