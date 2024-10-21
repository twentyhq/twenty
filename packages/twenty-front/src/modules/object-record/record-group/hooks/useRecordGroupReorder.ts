import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback } from 'react';

import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapGroupDefinitionsToViewGroups } from '@/views/utils/mapGroupDefinitionsToViewGroups';
import { useRecordGroupStates } from '@/object-record/record-group/hooks/useRecordGroupStates';
import { recordGroupDefinitionState } from '@/object-record/record-group/states/recordGroupDefinitionState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

type UseRecordGroupHandlersParams = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useRecordGroupReorder = ({
  objectNameSingular,
  viewBarId,
}: UseRecordGroupHandlersParams) => {
  const setRecordIndexGroupDefinitions = useSetRecoilComponentStateV2(
    recordGroupDefinitionState,
  );

  const { visibleRecordGroups } = useRecordGroupStates({
    objectNameSingular,
  });

  const { saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleOrderChange: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const reorderedVisibleBoardGroups = moveArrayItem(visibleRecordGroups, {
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      if (isDeeplyEqual(visibleRecordGroups, reorderedVisibleBoardGroups))
        return;

      const updatedGroups = [...reorderedVisibleBoardGroups].map(
        (group, index) => ({ ...group, position: index }),
      );

      setRecordIndexGroupDefinitions(updatedGroups);
      saveViewGroups(mapGroupDefinitionsToViewGroups(updatedGroups));
    },
    [saveViewGroups, setRecordIndexGroupDefinitions, visibleRecordGroups],
  );

  return {
    visibleRecordGroups,
    handleOrderChange,
  };
};
