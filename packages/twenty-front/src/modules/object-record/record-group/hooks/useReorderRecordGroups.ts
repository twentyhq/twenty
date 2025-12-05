import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { type ViewType } from '@/views/types/ViewType';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useRecoilCallback } from 'recoil';
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
  const { setRecordGroups } = useSetRecordGroups();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordGroupIdsFamilySelector = useRecoilComponentCallbackState(
    visibleRecordGroupIdsComponentFamilySelector,
    recordIndexId,
  );

  const { saveViewGroups } = useSaveCurrentViewGroups();

  const groupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const reorderRecordGroups = useRecoilCallback(
    ({ snapshot }) =>
      ({ fromIndex, toIndex }: ReorderRecordGroupsParams) => {
        const visibleRecordGroupIds = getSnapshotValue(
          snapshot,
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
        >((acc, recordGroupId, index) => {
          const recordGroupDefinition = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          if (!isDefined(recordGroupDefinition)) {
            return acc;
          }

          return [
            ...acc,
            {
              ...recordGroupDefinition,
              position: index,
            },
          ];
        }, []);

        if (!isDefined(groupFieldMetadata?.id)) {
          throw new Error('mainGroupByFieldMetadataId is required');
        }

        setRecordGroups({
          mainGroupByFieldMetadataId: groupFieldMetadata?.id,
          recordGroups: updatedRecordGroups,
          recordIndexId,
          objectMetadataItemId: objectMetadataItem.id,
        });
        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroups),
        );
      },
    [
      objectMetadataItem.id,
      groupFieldMetadata?.id,
      recordIndexId,
      saveViewGroups,
      setRecordGroups,
      viewType,
      visibleRecordGroupIdsFamilySelector,
    ],
  );

  return {
    reorderRecordGroups,
  };
};
