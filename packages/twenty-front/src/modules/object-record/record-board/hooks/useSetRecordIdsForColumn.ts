import { useStore } from 'jotai';
import { useRecoilCallback } from 'recoil';

import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordIdsForColumn = (recordBoardId?: string) => {
  const store = useStore();

  const recordGroupFieldMetadataAtom = useRecoilComponentStateCallbackStateV2(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardId,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const emptyRecordGroupByIdCallbackState = useRecoilComponentCallbackState(
    emptyRecordGroupByIdComponentFamilyState,
  );

  const setRecordIdsForColumn = useRecoilCallback(
    ({ set, snapshot }) =>
      (currentRecordGroupId: string, records: ObjectRecord[]) => {
        const recordGroup = store.get(
          recordGroupDefinitionFamilyState.atomFamily(currentRecordGroupId),
        );

        const existingRecordGroupRowIds = store.get(
          recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
        );

        const recordGroupFieldMetadata = store.get(
          recordGroupFieldMetadataAtom,
        );

        if (!isDefined(recordGroupFieldMetadata)) {
          return;
        }

        const recordGroupRowIds = records
          .filter(
            (record) =>
              record[recordGroupFieldMetadata.name] === recordGroup?.value,
          )
          .map((record) => record.id);

        if (!isDeeplyEqual(existingRecordGroupRowIds, recordGroupRowIds)) {
          store.set(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
            recordGroupRowIds,
          );
        }

        const isEmptyRecordGroup = getSnapshotValue(
          snapshot,
          emptyRecordGroupByIdCallbackState(currentRecordGroupId),
        );

        const computedIsEmptyRecordGroup = recordGroupRowIds.length === 0;

        if (computedIsEmptyRecordGroup !== isEmptyRecordGroup) {
          set(
            emptyRecordGroupByIdCallbackState(currentRecordGroupId),
            computedIsEmptyRecordGroup,
          );
        }
      },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordGroupFieldMetadataAtom,
      emptyRecordGroupByIdCallbackState,
      store,
    ],
  );

  return {
    setRecordIdsForColumn,
  };
};
