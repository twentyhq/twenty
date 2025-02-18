import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { availableFieldDefinitionsComponentState } from '@/views/states/availableFieldDefinitionsComponentState';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';

export const useInitViewBar = (viewBarInstanceId?: string) => {
  const setAvailableFieldDefinitions = useSetRecoilComponentStateV2(
    availableFieldDefinitionsComponentState,
    viewBarInstanceId,
  );

  const setAvailableSortDefinitions = useSetRecoilComponentStateV2(
    availableSortDefinitionsComponentState,
    viewBarInstanceId,
  );

  const setViewObjectMetadataId = useSetRecoilComponentStateV2(
    viewObjectMetadataIdComponentState,
    viewBarInstanceId,
  );

  return {
    setAvailableFieldDefinitions,
    setAvailableSortDefinitions,
    setViewObjectMetadataId,
  };
};
