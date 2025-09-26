import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';

import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableCells } from '@/object-record/record-table/record-table-row/components/RecordTableCells';
import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';

import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { ListenRecordUpdatesEffect } from '@/subscription/components/ListenRecordUpdatesEffect';
import { getDefaultRecordFieldsToListen } from '@/subscription/utils/getDefaultRecordFieldsToListen.util';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type RecordTableRowVirtualizedProps = {
  virtualIndex: number;
};

export const RecordTableRowVirtualized = ({
  virtualIndex,
}: RecordTableRowVirtualizedProps) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { objectNameSingular } = useRecordIndexContextOrThrow();
  const listenedFields = getDefaultRecordFieldsToListen({
    objectNameSingular,
  });

  const maxRealIndex =
    useRecoilComponentValue(totalNumberOfRecordsToVirtualizeComponentState) ??
    0;

  const realIndex = useRecoilComponentFamilyValue(
    realIndexByVirtualIndexComponentFamilyState,
    { virtualIndex },
  );

  const isFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    realIndex ?? 0,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const recordId = useRecoilComponentFamilyValue(
    recordIdByRealIndexComponentFamilyState,
    { realIndex },
  );

  if (!isDefined(realIndex) || realIndex >= maxRealIndex) {
    return null;
  }

  const pixelsFromTop =
    realIndex * (RECORD_TABLE_ROW_HEIGHT + 1) + (RECORD_TABLE_ROW_HEIGHT + 1);

  if (!isDefined(realIndex) || !isDefined(recordId)) {
    return (
      <div
        id={`row-virtual-index-${virtualIndex}`}
        style={{
          position: 'absolute',
          top: pixelsFromTop,
          height: 33,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 800,
            top: 10,
            zIndex: 4,
            color: 'GrayText',
          }}
        >
          {virtualIndex}-{realIndex}-{pixelsFromTop}-{recordId}
        </div>
        <RecordTableDraggableTr
          recordId={realIndex.toString()}
          draggableIndex={realIndex}
          focusIndex={realIndex}
        >
          <RecordTableCellDragAndDrop />
          <RecordTableCellCheckbox />
          {visibleRecordFields.map((recordField, index) => (
            <RecordTableCellLoading
              key={recordField.fieldMetadataItemId}
              recordFieldIndex={index}
            />
          ))}
          <RecordTablePlusButtonCellPlaceholder />
          <RecordTableLastEmptyCell />
        </RecordTableDraggableTr>
      </div>
    );
  }

  return (
    <div
      id={`row-virtual-index-${virtualIndex}`}
      style={{
        position: 'absolute',
        top: pixelsFromTop,
        height: 33,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 500,
          top: 10,
          zIndex: 4,
          color: 'GrayText',
          width: 500,
        }}
      >
        {virtualIndex}-{realIndex}-{pixelsFromTop}-{recordId}
      </div>
      <RecordTableDraggableTr
        recordId={recordId}
        draggableIndex={realIndex}
        focusIndex={realIndex}
      >
        {isRowFocusActive && isFocused && (
          <>
            {/* <RecordTableRowHotkeyEffect /> */}
            {/* <RecordTableRowArrowKeysEffect /> */}
          </>
        )}
        <RecordTableCellDragAndDrop />
        <RecordTableCellCheckbox />
        <RecordTableCells />
        <RecordTablePlusButtonCellPlaceholder />
        <RecordTableLastEmptyCell />
        <ListenRecordUpdatesEffect
          objectNameSingular={objectNameSingular}
          recordId={recordId}
          listenedFields={listenedFields}
        />
      </RecordTableDraggableTr>
    </div>
  );
};
