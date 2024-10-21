import { useCallback } from 'react';

import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapGroupDefinitionsToViewGroups } from '@/views/utils/mapGroupDefinitionsToViewGroups';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { recordGroupDefinitionState } from '@/object-record/record-group/states/recordGroupDefinitionState';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const [recordIndexGroupDefinitions, setRecordIndexGroupDefinitions] =
    useRecoilComponentStateV2(recordGroupDefinitionState);

  const { saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleVisibilityChange = useCallback(
    async (updatedGroupDefinition: RecordGroupDefinition) => {
      const updatedGroupsDefinitions = recordIndexGroupDefinitions.map(
        (groupDefinition) =>
          groupDefinition.id === updatedGroupDefinition.id
            ? {
                ...groupDefinition,
                isVisible: !groupDefinition.isVisible,
              }
            : groupDefinition,
      );

      setRecordIndexGroupDefinitions(updatedGroupsDefinitions);

      saveViewGroups(mapGroupDefinitionsToViewGroups(updatedGroupsDefinitions));
    },
    [
      recordIndexGroupDefinitions,
      setRecordIndexGroupDefinitions,
      saveViewGroups,
    ],
  );

  return {
    handleVisibilityChange,
  };
};
