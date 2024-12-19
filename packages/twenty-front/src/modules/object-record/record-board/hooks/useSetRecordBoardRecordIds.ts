import { useRecoilCallback } from 'recoil';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sortRecordsByPosition } from '@/object-record/utils/sortRecordsByPosition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewType } from '@/views/types/ViewType';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const useSetRecordBoardRecordIds = (recordBoardId?: string) => {
  const visibleRecordGroupIdsFamilySelector = useRecoilComponentCallbackStateV2(
    visibleRecordGroupIdsComponentFamilySelector,
  );

  const recordGroupFieldMetadataState = useRecoilComponentCallbackStateV2(
    recordGroupFieldMetadataComponentState,
    recordBoardId,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const setRecordIds = useRecoilCallback(
    ({ set, snapshot }) =>
      (records: ObjectRecord[]) => {
        const recordGroupIds = getSnapshotValue(
          snapshot,
          visibleRecordGroupIdsFamilySelector(ViewType.Kanban),
        );

        for (const recordGroupId of recordGroupIds) {
          const recordGroup = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          const existingRecordGroupRowIds = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupFamilyState(recordGroupId),
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
              recordIndexRecordIdsByGroupFamilyState(recordGroupId),
              recordGroupRowIds,
            );
          }
        }
      },
    [
      visibleRecordGroupIdsFamilySelector,
      recordIndexRecordIdsByGroupFamilyState,
      recordGroupFieldMetadataState,
    ],
  );

  return {
    setRecordIds,
  };
};
