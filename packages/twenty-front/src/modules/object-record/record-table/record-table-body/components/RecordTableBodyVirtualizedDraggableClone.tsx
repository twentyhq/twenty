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
import { useIsTableRowSecondaryDragged } from '@/object-record/record-table/record-table-row/hooks/useIsRecordSecondaryDragged';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledRowDraggableCloneCSSBridge = styled.div`
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

export const RecordTableBodyVirtualizedDraggableClone = ({
  draggableProvided,
  draggableSnapshot,
  rubric,
}: {
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
  rubric: DraggableRubric;
}) => {
  const realIndex = rubric.source.index;

  const recordId = useAtomComponentFamilySelectorValue(
    recordIdByRealIndexComponentFamilySelector,
    realIndex,
  );

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const { isSecondaryDragged } = useIsTableRowSecondaryDragged(recordId);

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

  if (!isDefined(recordId)) {
    return null;
  }

  return (
    <StyledRowDraggableCloneCSSBridge style={columnWidthStyles}>
      <RecordTableTr
        recordId={recordId}
        focusIndex={realIndex}
        ref={draggableProvided.innerRef}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...draggableProvided.draggableProps}
        style={{
          ...draggableProvided.draggableProps.style,
          background: draggableSnapshot.isDragging
            ? themeCssVariables.background.transparent.light
            : undefined,
          borderColor: draggableSnapshot.isDragging
            ? themeCssVariables.border.color.medium
            : 'transparent',
          opacity: isSecondaryDragged ? 0.3 : undefined,
        }}
        isDragging={draggableSnapshot.isDragging}
        data-testid={`row-id-${recordId}`}
        data-selectable-id={recordId}
        onClick={() => {}}
      >
        <RecordTableRowDraggableContextProvider
          value={{
            isDragging: draggableSnapshot.isDragging,
            dragHandleProps: draggableProvided.dragHandleProps,
          }}
        >
          <RecordTableCellDragAndDrop />
          <RecordTableCellCheckbox />
          <RecordTableFieldsCells />
          <RecordTablePlusButtonCellPlaceholder />
          <RecordTableLastEmptyCell />
          <RecordTableRowMultiDragPreview />
        </RecordTableRowDraggableContextProvider>
      </RecordTableTr>
    </StyledRowDraggableCloneCSSBridge>
  );
};
