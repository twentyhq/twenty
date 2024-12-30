import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardPendingRecordIdByColumnComponentFamilyState';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';
import { isDefined } from '~/utils/isDefined';

export const useUpsertBoardRecord = (columnId: string) => {
  const { objectMetadataItem, createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);
  const recordBoardPendingRecordIdByColumnState =
    useRecoilComponentCallbackStateV2(
      recordBoardPendingRecordIdByColumnComponentFamilyState,
    );
  const upsertBoardRecord = useRecoilCallback(
    ({ snapshot, set }) =>
      (persistField: () => void, recordId: string, fieldName: string) => {
        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);
        console.log('useUpsertBoardRecord');

        const fieldScopeId = getScopeIdFromComponentId(
          `${recordId}-${fieldName}`,
        );

        const draftValueSelector = extractComponentSelector(
          recordFieldInputDraftValueComponentSelector,
          fieldScopeId,
        );

        const draftValue = getSnapshotValue(snapshot, draftValueSelector());

        const pendingRecord = getSnapshotValue(
          snapshot,
          recordBoardPendingRecordIdByColumnState(columnId),
        );

        if (isDefined(pendingRecord?.recordId) && isDefined(draftValue)) {
          // Clear pending record
          set(recordBoardPendingRecordIdByColumnState(columnId), {
            recordId: null,
            isOpportunity: false,
            position: undefined,
            company: null,
          });

          // Create the record
          createOneRecord({
            id: pendingRecord.recordId,
            [labelIdentifierFieldMetadataItem?.name ?? 'name']: draftValue,
            [selectFieldMetadataItem.name]: columnId,
            position: pendingRecord.position === 'first' ? 0 : 999999,
          });
        } else if (!pendingRecord?.recordId) {
          persistField();
        }
      },
    [
      createOneRecord,
      objectMetadataItem,
      columnId,
      selectFieldMetadataItem,
      recordBoardPendingRecordIdByColumnState,
    ],
  );

  return { upsertBoardRecord };
};
