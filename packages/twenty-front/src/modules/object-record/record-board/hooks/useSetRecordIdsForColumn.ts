import { useRecoilCallback } from 'recoil';

import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordIdsForColumn = (recordBoardId?: string) => {
  const recordGroupFieldMetadataState = useRecoilComponentCallbackState(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardId,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const emptyRecordGroupByIdCallbackState = useRecoilComponentCallbackState(
    emptyRecordGroupByIdComponentFamilyState,
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
      recordGroupFieldMetadataState,
      emptyRecordGroupByIdCallbackState,
    ],
  );

  return {
    setRecordIdsForColumn,
  };
};
