import { useRecoilCallback } from 'recoil';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sortRecordsByPosition } from '@/object-record/utils/sortRecordsByPosition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const useSetRecordIdsForColumn = (recordBoardId?: string) => {
  const recordGroupFieldMetadataState = useRecoilComponentCallbackStateV2(
    recordGroupFieldMetadataComponentState,
    recordBoardId,
  );

  const recordIndexRowIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    recordIndexRowIdsByGroupComponentFamilyState,
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
          recordIndexRowIdsByGroupFamilyState(currentRecordGroupId),
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
          .sort(sortRecordsByPosition)
          .map((record) => record.id);

        if (!isDeeplyEqual(existingRecordGroupRowIds, recordGroupRowIds)) {
          set(
            recordIndexRowIdsByGroupFamilyState(currentRecordGroupId),
            recordGroupRowIds,
          );
        }
      },
    [recordIndexRowIdsByGroupFamilyState, recordGroupFieldMetadataState],
  );

  return {
    setRecordIdsForColumn,
  };
};
