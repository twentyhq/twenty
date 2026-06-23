import { useStore } from 'jotai';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { usePersistRelationRecordGroups } from '@/object-record/record-group/hooks/usePersistRelationRecordGroups';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { type ViewType } from '@/views/types/ViewType';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UseReorderRecordGroupsParams = {
  recordIndexId: string;
  viewType: ViewType;
};

type ReorderRecordGroupsParams = {
  fromIndex: number;
  toIndex: number;
};

export const useReorderRecordGroups = ({
  recordIndexId,
  viewType,
}: UseReorderRecordGroupsParams) => {
  const store = useStore();
  const { setRecordGroups } = useSetRecordGroups();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordGroupIdsFamilySelector =
    useAtomComponentFamilySelectorCallbackState(
      visibleRecordGroupIdsComponentFamilySelector,
      recordIndexId,
    );

  const { saveViewGroups } = useSaveCurrentViewGroups();

  const { persistRelationRecordGroups } = usePersistRelationRecordGroups();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const reorderRecordGroups = useCallback(
    ({ fromIndex, toIndex }: ReorderRecordGroupsParams) => {
      const visibleRecordGroupIds = store.get(
        visibleRecordGroupIdsFamilySelector(viewType),
      );

      const reorderedVisibleRecordGroupIds = moveArrayItem(
        visibleRecordGroupIds,
        {
          fromIndex,
          toIndex,
        },
      );

      if (
        isDeeplyEqual(visibleRecordGroupIds, reorderedVisibleRecordGroupIds)
      ) {
        return;
      }

      const updatedRecordGroups = reorderedVisibleRecordGroupIds.reduce<
        RecordGroupDefinition[]
      >((acc, recordGroupId, reorderIndex) => {
        const recordGroupDefinition = store.get(
          recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
        );

        if (!isDefined(recordGroupDefinition)) {
          return acc;
        }

        return [
          ...acc,
          {
            ...recordGroupDefinition,
            position: reorderIndex,
          },
        ];
      }, []);

      if (!isDefined(recordIndexGroupFieldMetadataItem?.id)) {
        throw new Error('mainGroupByFieldMetadataId is required');
      }

      setRecordGroups({
        mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem?.id,
        recordGroups: updatedRecordGroups,
        recordIndexId,
        objectMetadataItemId: objectMetadataItem.id,
      });

      if (
        isDefined(recordIndexGroupFieldMetadataItem) &&
        isManyToOneRelationField(recordIndexGroupFieldMetadataItem)
      ) {
        persistRelationRecordGroups(updatedRecordGroups);
      } else {
        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroups),
        );
      }
    },
    [
      objectMetadataItem.id,
      persistRelationRecordGroups,
      recordIndexGroupFieldMetadataItem,
      recordIndexId,
      saveViewGroups,
      setRecordGroups,
      store,
      viewType,
      visibleRecordGroupIdsFamilySelector,
    ],
  );

  return {
    reorderRecordGroups,
  };
};
