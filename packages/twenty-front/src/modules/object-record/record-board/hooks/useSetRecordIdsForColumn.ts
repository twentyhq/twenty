import { useRecoilCallback } from 'recoil';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordIdsForColumn = (recordBoardId?: string) => {
  const recordGroupFieldMetadataState = useRecoilComponentCallbackState(
    recordGroupFieldMetadataComponentState,
    recordBoardId,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const setRecordIdsForColumn = useRecoilCallback(
    ({ set, snapshot }) =>
      (currentRecordGroupId: string, records: ObjectRecord[]) => {
        const recordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(currentRecordGroupId),
        );

        const existingRecordGroupRowIds = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
        );

        const recordGroupFieldMetadata = getSnapshotValue(
          snapshot,
          recordGroupFieldMetadataState,
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
          set(
            recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
            recordGroupRowIds,
          );
        }
      },
    [recordIndexRecordIdsByGroupFamilyState, recordGroupFieldMetadataState],
  );

  return {
    setRecordIdsForColumn,
  };
};
