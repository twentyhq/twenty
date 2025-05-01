import { OnDragEndResponder } from '@hello-pangea/dnd';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { ViewType } from '@/views/types/ViewType';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UseRecordGroupHandlersParams = {
  viewBarId: string;
  viewType: ViewType;
};

export const useRecordGroupReorder = ({
  viewBarId,
  viewType,
}: UseRecordGroupHandlersParams) => {
  const { setRecordGroups } = useSetRecordGroups();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordGroupIdsFamilySelector = useRecoilComponentCallbackStateV2(
    visibleRecordGroupIdsComponentFamilySelector,
  );

  const { saveViewGroups } = useSaveCurrentViewGroups();

  const reorderRecordGroups = useRecoilCallback(
    ({ snapshot }) =>
      (fromIndex: number, toIndex: number) => {
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

        setRecordGroups(updatedRecordGroups, viewBarId, objectMetadataItem.id);
        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroups),
        );
      },
    [
      objectMetadataItem,
      saveViewGroups,
      setRecordGroups,
      viewBarId,
      viewType,
      visibleRecordGroupIdsFamilySelector,
    ],
  );

  const handleOrderChange: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }

    reorderRecordGroups(result.source.index - 1, result.destination.index - 1);
  };

  return {
    handleOrderChange,
    reorderRecordGroups,
  };
};
