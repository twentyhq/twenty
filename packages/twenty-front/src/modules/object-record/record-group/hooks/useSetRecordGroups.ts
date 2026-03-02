import { useStore } from 'jotai';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordGroups = () => {
  const store = useStore();

  const setRecordGroups = useCallback(
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
      const objectMetadataItems = store.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
      );

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      const currentRecordGroupIds = store.get(
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
      const recordIndexGroupFieldMetadata =
        recordIndexGroupFieldMetadataItemComponentState.atomFamily({
          instanceId: recordIndexId,
        });
      const currentFieldMetadata = store.get(recordIndexGroupFieldMetadata);

      // Set the field metadata linked to the record groups
      if (!isDeeplyEqual(fieldMetadata, currentFieldMetadata)) {
        store.set(recordIndexGroupFieldMetadata, fieldMetadata);
      }

      // Set the record groups by id
      recordGroups.forEach((recordGroup) => {
        const existingRecordGroup = store.get(
          recordGroupDefinitionFamilyState.atomFamily(recordGroup.id),
        );

        if (isDeeplyEqual(existingRecordGroup, recordGroup)) {
          return;
        }

        store.set(
          recordGroupDefinitionFamilyState.atomFamily(recordGroup.id),
          recordGroup,
        );
      });

      const recordGroupIds = recordGroups.map(({ id }) => id);

      // Get ids that has been removed between the current and new record groups
      const removedRecordGroupIds = currentRecordGroupIds.filter(
        (id) => !recordGroupIds.includes(id),
      );

      // Remove the record groups that has been removed
      removedRecordGroupIds.forEach((id) => {
        store.set(recordGroupDefinitionFamilyState.atomFamily(id), undefined);
      });

      if (isDeeplyEqual(currentRecordGroupIds, recordGroupIds)) {
        return;
      }

      // Set the record group ids
      store.set(
        recordGroupIdsComponentState.atomFamily({
          instanceId: recordIndexId,
        }),
        recordGroupIds,
      );
    },
    [store],
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
