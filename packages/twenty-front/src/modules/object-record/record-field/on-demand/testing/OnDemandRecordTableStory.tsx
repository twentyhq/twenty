import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ON_DEMAND_FIELD_STORY_OBJECT_METADATA } from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/components/RecordTableBodyContextProvider';
import {
  getRecordTableColumnWidthInlineStyles,
  RecordTableStyleWrapper,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { RecordTableBodyFocusKeyboardEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFocusKeyboardEffect';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { RecordTableRowCells } from '@/object-record/record-table/record-table-row/components/RecordTableRowCells';
import { RecordTableStaticTr } from '@/object-record/record-table/record-table-row/components/RecordTableStaticTr';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

type OnDemandRecordTableStoryProps = {
  recordId: string;
  objectMetadataItem?: EnrichedObjectMetadataItem;
};

export const OnDemandRecordTableStory = ({
  recordId,
  objectMetadataItem = ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
}: OnDemandRecordTableStoryProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
  );
  const { moveHoverToCurrentCell } =
    useMoveHoverToCurrentCell('on-demand-story');

  const handleMouseMove = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const cellElement = event.target.closest<HTMLElement>(
      '[data-record-table-col]',
    );

    if (!isDefined(cellElement)) {
      return;
    }

    moveHoverToCurrentCell({
      column: Number(cellElement.dataset.recordTableCol),
      row: Number(cellElement.dataset.recordTableRow),
    });
  };

  return (
    <RecordTableContextProvider
      value={{
        recordTableId: 'on-demand-story',
        viewBarId: 'on-demand-story',
        objectNameSingular: 'callRecording',
        objectMetadataItem,
        objectMetadataItems: [objectMetadataItem],
        objectPermissions: getObjectPermissionsForObject(
          {},
          objectMetadataItem.id,
        ),
        isObjectReadOnly: false,
        visibleRecordFields: visibleRecordFields,
        triggerEvent: 'CLICK',
      }}
    >
      <RecordTableUpdateContext.Provider
        value={({ variables }) => {
          updateOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
            idToUpdate: recordId,
            updateOneRecordInput: variables.updateOneRecordInput,
          });
        }}
      >
        <RecordTableBodyContextProvider>
          <RecordTableStyleWrapper
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setRecordTableHoverPosition(null)}
            style={getRecordTableColumnWidthInlineStyles({
              visibleRecordFields: visibleRecordFields,
              isDragColumnHidden: true,
              isCheckboxColumnHidden: true,
            })}
          >
            <RecordTableBodyFocusKeyboardEffect />
            <RecordTableStaticTr recordId={recordId} focusIndex={0}>
              <RecordTableRowCells rowIndexForFocus={0} />
            </RecordTableStaticTr>
            <RecordTableCellPortals />
          </RecordTableStyleWrapper>
        </RecordTableBodyContextProvider>
      </RecordTableUpdateContext.Provider>
    </RecordTableContextProvider>
  );
};
