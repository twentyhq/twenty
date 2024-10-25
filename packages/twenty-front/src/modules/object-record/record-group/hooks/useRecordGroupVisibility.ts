import { useCallback } from 'react';

import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const [recordGroupDefinitions, setRecordGroupDefinitions] =
    useRecoilComponentStateV2(recordGroupDefinitionsComponentState);

  const { saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleVisibilityChange = useCallback(
    async (updatedRecordGroupDefinition: RecordGroupDefinition) => {
      const updatedRecordGroupDefinitions = recordGroupDefinitions.map(
        (groupDefinition) =>
          groupDefinition.id === updatedRecordGroupDefinition.id
            ? {
                ...groupDefinition,
                isVisible: !groupDefinition.isVisible,
              }
            : groupDefinition,
      );

      setRecordGroupDefinitions(updatedRecordGroupDefinitions);

      saveViewGroups(
        mapRecordGroupDefinitionsToViewGroups(updatedRecordGroupDefinitions),
      );
    },
    [recordGroupDefinitions, setRecordGroupDefinitions, saveViewGroups],
  );

  return {
    handleVisibilityChange,
  };
};
