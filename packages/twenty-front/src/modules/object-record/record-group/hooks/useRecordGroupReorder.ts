import { OnDragEndResponder } from '@hello-pangea/dnd';

import { useSetRecordGroup } from '@/object-record/record-group/hooks/useSetRecordGroup';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { ViewType } from '@/views/types/ViewType';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useRecoilCallback } from 'recoil';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

type UseRecordGroupHandlersParams = {
  viewBarId: string;
  viewType: ViewType;
};

export const useRecordGroupReorder = ({
  viewBarId,
  viewType,
}: UseRecordGroupHandlersParams) => {
  const setRecordGroup = useSetRecordGroup(viewBarId);

  const visibleRecordGroupIdsFamilySelector = useRecoilComponentCallbackStateV2(
    visibleRecordGroupIdsComponentFamilySelector,
  );

  const { saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleOrderChange: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) {
          return;
        }

        const visibleRecordGroupIds = getSnapshotValue(
          snapshot,
          visibleRecordGroupIdsFamilySelector(viewType),
        );

        const reorderedVisibleRecordGroupIds = moveArrayItem(
          visibleRecordGroupIds,
          {
            fromIndex: result.source.index - 1,
            toIndex: result.destination.index - 1,
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

        setRecordGroup(updatedRecordGroups);
        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroups),
        );
      },
    [
      saveViewGroups,
      setRecordGroup,
      viewType,
      visibleRecordGroupIdsFamilySelector,
    ],
  );

  return {
    handleOrderChange,
  };
};
