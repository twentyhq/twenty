import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';

import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableDraggableTrFirstRowOfGroup } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTrFirstRowOfGroup';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowArrowKeysEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowArrowKeysEffect';
import { RecordTableRowHotkeyEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowHotkeyEffect';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { ListenRecordUpdatesEffect } from '@/sse-db-event/components/ListenRecordUpdatesEffect';
import { getDefaultRecordFieldsToListen } from '@/sse-db-event/utils/getDefaultRecordFieldsToListen';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type RecordTableRowProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
  isFirstRowOfGroup: boolean;
};

export const RecordTableRow = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
  isFirstRowOfGroup,
}: RecordTableRowProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();
  const listenedFields = getDefaultRecordFieldsToListen({
    objectNameSingular,
  });
  const isFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    rowIndexForFocus,
  );
  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );
  const isSseDbEventsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SSE_DB_EVENTS_ENABLED,
  );

  return isFirstRowOfGroup ? (
    <RecordTableDraggableTrFirstRowOfGroup
      recordId={recordId}
      draggableIndex={rowIndexForDrag}
      focusIndex={rowIndexForFocus}
    >
      {isRowFocusActive && isFocused && (
        <>
          <RecordTableRowHotkeyEffect />
          <RecordTableRowArrowKeysEffect />
        </>
      )}
      <RecordTableCellDragAndDrop />
      <RecordTableCellCheckbox />
      <RecordTableFieldsCells />
      <RecordTablePlusButtonCellPlaceholder />
      <RecordTableLastEmptyCell />
      {!isSseDbEventsEnabled && (
        <ListenRecordUpdatesEffect
          objectNameSingular={objectNameSingular}
          recordId={recordId}
          listenedFields={listenedFields}
        />
      )}
    </RecordTableDraggableTrFirstRowOfGroup>
  ) : (
    <RecordTableDraggableTr
      recordId={recordId}
      draggableIndex={rowIndexForDrag}
      focusIndex={rowIndexForFocus}
    >
      {isRowFocusActive && isFocused && (
        <>
          <RecordTableRowHotkeyEffect />
          <RecordTableRowArrowKeysEffect />
        </>
      )}
      <RecordTableCellDragAndDrop />
      <RecordTableCellCheckbox />
      <RecordTableFieldsCells />
      <RecordTablePlusButtonCellPlaceholder />
      <RecordTableLastEmptyCell />
    </RecordTableDraggableTr>
  );
};
