import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { recordIndexGroupDefinitionsState } from '@/object-record/record-index/states/recordIndexGroupDefinitionsState';
import { mapGroupDefinitionsToViewGroups } from '@/views/utils/mapGroupDefinitionsToViewGroups';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const [recordIndexGroupDefinitions, setRecordIndexGroupDefinitions] =
    useRecoilState(recordIndexGroupDefinitionsState);

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
