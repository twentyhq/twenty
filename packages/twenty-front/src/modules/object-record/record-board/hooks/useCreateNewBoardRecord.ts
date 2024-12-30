import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { isInlineCellInEditModeScopedState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeScopedState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDefined } from '@ui/utilities/isDefined';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '../states/recordBoardPendingRecordIdByColumnComponentFamilyState';

export const useCreateNewBoardRecord = (recordBoardId: string) => {
  const recordBoardPendingRecordIdByColumnState =
    useRecoilComponentCallbackStateV2(
      recordBoardPendingRecordIdByColumnComponentFamilyState,
      recordBoardId,
    );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const createNewBoardRecord = useRecoilCallback(
    ({ set }) =>
      (
        columnId: string,
        position: 'first' | 'last',
        isOpportunity: boolean,
      ) => {
        const recordId = v4();

        set(recordBoardPendingRecordIdByColumnState(columnId), {
          recordId,
          isOpportunity,
          position,
          company: null,
        });
        if (isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)) {
          const inlineCellScopeId =
            recordId + objectMetadataItem.labelIdentifierFieldMetadataId;
          set(isInlineCellInEditModeScopedState(inlineCellScopeId), true);
        }

        return recordId;
      },
    [recordBoardPendingRecordIdByColumnState, objectMetadataItem],
  );

  return {
    createNewBoardRecord,
  };
};
