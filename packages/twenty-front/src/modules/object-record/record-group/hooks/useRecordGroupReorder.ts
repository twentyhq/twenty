import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback } from 'react';

import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UseRecordGroupHandlersParams = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useRecordGroupReorder = ({
  objectNameSingular,
  viewBarId,
}: UseRecordGroupHandlersParams) => {
  const setRecordGroupDefinitions = useSetRecoilComponentStateV2(
    recordGroupDefinitionsComponentState,
  );

  const { visibleRecordGroups } = useRecordGroups({
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

      setRecordGroupDefinitions(updatedGroups);
      saveViewGroups(mapRecordGroupDefinitionsToViewGroups(updatedGroups));
    },
    [saveViewGroups, setRecordGroupDefinitions, visibleRecordGroups],
  );

  return {
    visibleRecordGroups,
    handleOrderChange,
  };
};
