import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardPendingRecordIdByColumnComponentFamilyState';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
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
      (
        persistField: () => void,
        recordId: string,
        fieldName: string,
        columnValue: string,
      ) => {
        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);
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
          const createInput = {
            id: pendingRecord.recordId,
            [labelIdentifierFieldMetadataItem?.name ?? 'name']: draftValue,
            [selectFieldMetadataItem.name]: columnValue,
            position: pendingRecord.position,
          };

          createOneRecord(createInput);

          set(recordBoardPendingRecordIdByColumnState(columnId), {
            recordId: null,
            position: undefined,
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
