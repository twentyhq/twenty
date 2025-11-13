import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { HorizontalScrollBoxShadowCSS } from '@/object-record/record-table/components/RecordTableStyleWrapper';
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
import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

// TODO: see how we can merge this with RecordTableStyleWrapper,
// because we have not decided a strategy for sharing CSS bits yet
const StyledRowDraggableCloneCSSBridge = styled.div<{
  visibleRecordFields: RecordField[];
  lastColumnWidth: number;
}>`
  div.table-cell:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${TABLE_Z_INDEX.cell.withGroups.sticky};
  }

  div.table-cell:nth-of-type(2) {
    position: sticky;
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
    z-index: ${TABLE_Z_INDEX.cell.withoutGroups.sticky};
  }

  div.table-cell-0-0 {
    position: sticky;
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;

    ${HorizontalScrollBoxShadowCSS}
  }

  div.table-cell:nth-of-type(3) {
    position: sticky;
    left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
    z-index: ${TABLE_Z_INDEX.cell.withoutGroups.sticky};

    ${HorizontalScrollBoxShadowCSS}
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
    returnedCSS += `${RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_VARIABLE_NAME}: ${lastColumnWidth}px;`;

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

  const theme = useTheme();

  const recordId = useRecoilComponentFamilyValue(
    recordIdByRealIndexComponentFamilyState,
    { realIndex },
  );

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const { isSecondaryDragged } = useIsTableRowSecondaryDragged(recordId);

  if (!isDefined(recordId)) {
    return null;
  }

  return (
    <StyledRowDraggableCloneCSSBridge
      lastColumnWidth={lastColumnWidth}
      visibleRecordFields={visibleRecordFields}
    >
      <RecordTableTr
        recordId={recordId}
        focusIndex={realIndex}
        ref={draggableProvided.innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...draggableProvided.draggableProps}
        style={{
          ...draggableProvided.draggableProps.style,
          background: draggableSnapshot.isDragging
            ? theme.background.transparent.light
            : undefined,
          borderColor: draggableSnapshot.isDragging
            ? `${theme.border.color.medium}`
            : 'transparent',
          opacity: isSecondaryDragged ? 0.3 : undefined,
        }}
        isDragging={draggableSnapshot.isDragging}
        data-testid={`row-id-${recordId}`}
        data-virtualized-id={recordId}
        data-selectable-id={recordId}
        onClick={() => {}}
        isFirstRowOfGroup={false}
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
