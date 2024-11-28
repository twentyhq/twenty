import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const useSetRecordGroup = (viewId?: string) => {
  const { objectMetadataItem } = useContext(RecordIndexRootPropsContext);

  const recordIndexRecordGroupIdsState = useRecoilComponentCallbackStateV2(
    recordGroupIdsComponentState,
    viewId,
  );

  const recordGroupFieldMetadataState = useRecoilComponentCallbackStateV2(
    recordGroupFieldMetadataComponentState,
    viewId,
  );

  return useRecoilCallback(
    ({ snapshot, set }) =>
      (recordGroups: RecordGroupDefinition[]) => {
        if (recordGroups.length === 0) {
          return;
        }

        const currentRecordGroupId = getSnapshotValue(
          snapshot,
          recordIndexRecordGroupIdsState,
        );
        const fieldMetadataId = recordGroups[0].fieldMetadataId;
        const fieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === fieldMetadataId,
        );
        const currentFieldMetadata = getSnapshotValue(
          snapshot,
          recordGroupFieldMetadataState,
        );

        // Set the field metadata linked to the record groups
        if (
          isDefined(fieldMetadata) &&
          !isDeeplyEqual(fieldMetadata, currentFieldMetadata)
        ) {
          set(recordGroupFieldMetadataState, fieldMetadata);
        }

        // Set the record groups by id
        recordGroups.forEach((recordGroup) => {
          const existingRecordGroup = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroup.id),
          );

          if (isDeeplyEqual(existingRecordGroup, recordGroup)) {
            return;
          }

          set(recordGroupDefinitionFamilyState(recordGroup.id), recordGroup);
        });

        const recordGroupIds = recordGroups.map(({ id }) => id);

        if (isDeeplyEqual(currentRecordGroupId, recordGroupIds)) {
          return;
        }

        // Set the record group ids
        set(recordIndexRecordGroupIdsState, recordGroupIds);
      },
    [
      objectMetadataItem.fields,
      recordGroupFieldMetadataState,
      recordIndexRecordGroupIdsState,
    ],
  );
};
