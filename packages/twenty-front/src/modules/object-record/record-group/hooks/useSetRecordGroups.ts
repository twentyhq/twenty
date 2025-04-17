import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewGroup } from '@/views/types/ViewGroup';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from 'twenty-shared/utils';

export const useSetRecordGroups = () => {
  const setRecordGroups = useRecoilCallback(
    ({ snapshot, set }) =>
      (
        recordGroups: RecordGroupDefinition[],
        recordIndexId: string,
        objectMetadataItemId: string,
      ) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === objectMetadataItemId,
        );

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        const currentRecordGroupIds = getSnapshotValue(
          snapshot,
          recordGroupIdsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );
        const fieldMetadataId = recordGroups?.[0]?.fieldMetadataId;
        const fieldMetadata = fieldMetadataId
          ? objectMetadataItem.fields.find(
              (field) => field.id === fieldMetadataId,
            )
          : undefined;
        const currentFieldMetadata = getSnapshotValue(
          snapshot,
          recordGroupFieldMetadataComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        // Set the field metadata linked to the record groups
        if (!isDeeplyEqual(fieldMetadata, currentFieldMetadata)) {
          set(
            recordGroupFieldMetadataComponentState.atomFamily({
              instanceId: recordIndexId,
            }),
            fieldMetadata,
          );
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

        // Get ids that has been removed between the current and new record groups
        const removedRecordGroupIds = currentRecordGroupIds.filter(
          (id) => !recordGroupIds.includes(id),
        );

        // Remove the record groups that has been removed
        removedRecordGroupIds.forEach((id) => {
          set(recordGroupDefinitionFamilyState(id), undefined);
        });

        if (isDeeplyEqual(currentRecordGroupIds, recordGroupIds)) {
          return;
        }

        // Set the record group ids
        set(
          recordGroupIdsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
          recordGroupIds,
        );
      },
    [],
  );

  const setRecordGroupsFromViewGroups = useCallback(
    (
      viewId: string,
      viewGroups: ViewGroup[],
      objectMetadataItem: ObjectMetadataItem,
    ) => {
      const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        viewId,
      );

      const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
        objectMetadataItem,
        viewGroups,
      });

      setRecordGroups(
        newGroupDefinitions,
        recordIndexId,
        objectMetadataItem.id,
      );
    },
    [setRecordGroups],
  );

  return {
    setRecordGroups,
    setRecordGroupsFromViewGroups,
  };
};
