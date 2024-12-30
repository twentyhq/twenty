import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from '~/utils/isDefined';

import { useRecordBoardColumnContextOrThrow } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { RecordBoardContext } from '../contexts/RecordBoardContext';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '../states/recordBoardPendingRecordIdByColumnComponentFamilyState';

export const useUpsertBoardOpportunityRecord = (recordBoardId: string) => {
  const { selectFieldMetadataItem, createOneRecord } =
    useContext(RecordBoardContext);
  const columnContext = useRecordBoardColumnContextOrThrow();

  const recordBoardPendingRecordIdByColumnState =
    useRecoilComponentCallbackStateV2(
      recordBoardPendingRecordIdByColumnComponentFamilyState,
      recordBoardId,
    );

  const upsertBoardOpportunityRecord = useRecoilCallback(
    ({ snapshot, set }) =>
      async (columnId: string, company?: RecordForSelect) => {
        const pendingRecord = snapshot
          .getLoadable(recordBoardPendingRecordIdByColumnState(columnId))
          .getValue();

        if (!pendingRecord.recordId) {
          return;
        }

        const { position } = pendingRecord;
        set(recordBoardPendingRecordIdByColumnState(columnId), {
          recordId: null,
          position: undefined,
        });

        if (isDefined(company)) {
          await createOneRecord({
            [selectFieldMetadataItem.name]:
              columnContext?.columnDefinition.value,
            position,
            companyId: company.id,
            name: company.name,
          });
        }
      },
    [
      selectFieldMetadataItem,
      createOneRecord,
      recordBoardPendingRecordIdByColumnState,
      columnContext,
    ],
  );

  return {
    upsertBoardOpportunityRecord,
  };
};
