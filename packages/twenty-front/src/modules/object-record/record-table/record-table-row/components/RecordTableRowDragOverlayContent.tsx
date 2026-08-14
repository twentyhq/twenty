import { type Draggable } from '@dnd-kit/dom';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { HorizontalScrollBoxShadowCSS } from '@/object-record/record-table/components/HorizontalScrollBoxShadowCSS';
import {
  getRecordTableColumnWidthInlineStyles,
  RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR,
  RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthVariableName';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';

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
      width: calc(${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px * var(--t-scale, 1));
      max-width: calc(${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px * var(--t-scale, 1));
      min-width: calc(${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px * var(--t-scale, 1));
    }
  }`;
    }

    return baseRule;
  },
).join('\n');

// The overlay renders in a portal outside the table, so the column width CSS
// variables and sticky cell rules of the table ancestors are redeclared here.
const StyledRowDragOverlayCSSBridge = styled.div`
  position: relative;

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
    max-width: calc(
      ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px * var(--t-scale, 1)
    );
    min-width: calc(
      ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px * var(--t-scale, 1)
    );
    width: calc(
      ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px * var(--t-scale, 1)
    );
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

// The full-width row preview would overhang overlays such as the record side
// panel when the visible table is narrower than the row, so it is clipped to
// the scroll wrapper's width. The multi-drag counter chip renders outside
// this container because it pokes past the row's top-left corner.
const StyledRowClipContainer = styled.div`
  overflow: hidden;
`;

export const RecordTableRowDragOverlayContent = ({
  source,
}: {
  source: Draggable | null;
}) => {
  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const { visibleRecordFields, recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement(
    `record-table-scroll-${recordTableId}`,
  );

  const visibleTableWidth = scrollWrapperHTMLElement?.clientWidth;

  const columnWidthStyles = useMemo(() => {
    const styles: Record<string, string> =
      getRecordTableColumnWidthInlineStyles({
        visibleRecordFields,
        isDragColumnHidden: isRecordTableDragColumnHidden,
        isCheckboxColumnHidden: isRecordTableCheckboxColumnHidden,
      });
    styles[RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME] =
      `${lastColumnWidth}px`;
    styles[
      RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME
    ] = `${lastColumnWidth}px`;
    return styles;
  }, [
    visibleRecordFields,
    lastColumnWidth,
    isRecordTableDragColumnHidden,
    isRecordTableCheckboxColumnHidden,
  ]);

  const sourceData = source?.data as RecordTableRowDragData | undefined;

  if (!isDefined(source) || !isDefined(sourceData)) {
    return null;
  }

  const recordId = sourceData.recordId;

  return (
    <StyledRowDragOverlayCSSBridge style={columnWidthStyles}>
      <StyledRowClipContainer
        style={
          isDefined(visibleTableWidth)
            ? { maxWidth: `${visibleTableWidth}px` }
            : undefined
        }
      >
        <RecordTableTr
          recordId={recordId}
          focusIndex={sourceData.focusIndex}
          style={{
            background: themeCssVariables.background.secondary,
            borderColor: themeCssVariables.border.color.medium,
          }}
          isDragging
          data-testid={`row-id-${recordId}`}
          data-selectable-id={recordId}
          onClick={() => {}}
        >
          <RecordTableRowDraggableContextProvider value={{ isDragging: true }}>
            {!isRecordTableDragColumnHidden && <RecordTableCellDragAndDrop />}
            {!isRecordTableCheckboxColumnHidden && <RecordTableCellCheckbox />}
            <RecordTableFieldsCells />
            <RecordTablePlusButtonCellPlaceholder />
            <RecordTableLastEmptyCell />
          </RecordTableRowDraggableContextProvider>
        </RecordTableTr>
      </StyledRowClipContainer>
      <RecordTableRowMultiDragPreview recordId={recordId} />
    </StyledRowDragOverlayCSSBridge>
  );
};
