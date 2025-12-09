import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordGroups = () => {
  const setRecordGroups = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        mainGroupByFieldMetadataId,
        recordGroups,
        recordIndexId,
        objectMetadataItemId,
      }: {
        mainGroupByFieldMetadataId: string;
        recordGroups: RecordGroupDefinition[];
        recordIndexId: string;
        objectMetadataItemId: string;
      }) => {
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

        const fieldMetadataId = mainGroupByFieldMetadataId;
        const fieldMetadata = fieldMetadataId
          ? objectMetadataItem.fields.find(
              (field) => field.id === fieldMetadataId,
            )
          : undefined;
        const currentFieldMetadata = getSnapshotValue(
          snapshot,
          recordIndexGroupFieldMetadataItemComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        // Set the field metadata linked to the record groups
        if (!isDeeplyEqual(fieldMetadata, currentFieldMetadata)) {
          set(
            recordIndexGroupFieldMetadataItemComponentState.atomFamily({
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
    ({
      viewId,
      mainGroupByFieldMetadataId,
      viewGroups,
      objectMetadataItem,
    }: {
      viewId: string;
      mainGroupByFieldMetadataId: string;
      viewGroups: ViewGroup[];
      objectMetadataItem: ObjectMetadataItem;
    }) => {
      const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
        objectMetadataItem.namePlural,
        viewId,
      );

      const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
        mainGroupByFieldMetadataId,
        objectMetadataItem,
        viewGroups,
      });

      setRecordGroups({
        mainGroupByFieldMetadataId,
        recordGroups: newGroupDefinitions,
        recordIndexId,
        objectMetadataItemId: objectMetadataItem.id,
      });
    },
    [setRecordGroups],
  );

  return {
    setRecordGroups,
    setRecordGroupsFromViewGroups,
  };
};
