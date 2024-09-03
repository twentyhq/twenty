import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { availableFieldDefinitionsInstanceState } from '@/views/states/availableFieldDefinitionsInstanceState';
import { availableFilterDefinitionsInstanceState } from '@/views/states/availableFilterDefinitionsInstanceState';
import { availableSortDefinitionsInstanceState } from '@/views/states/availableSortDefinitionsInstanceState';
import { viewObjectMetadataIdInstanceState } from '@/views/states/viewObjectMetadataIdInstanceState';

export const useInitViewBar = (viewBarInstanceId?: string) => {
  const setAvailableFieldDefinitions = useSetRecoilInstanceState(
    availableFieldDefinitionsInstanceState,
    viewBarInstanceId,
  );

  const setAvailableSortDefinitions = useSetRecoilInstanceState(
    availableSortDefinitionsInstanceState,
    viewBarInstanceId,
  );

  const setAvailableFilterDefinitions = useSetRecoilInstanceState(
    availableFilterDefinitionsInstanceState,
    viewBarInstanceId,
  );

  const setViewObjectMetadataId = useSetRecoilInstanceState(
    viewObjectMetadataIdInstanceState,
    viewBarInstanceId,
  );

  return {
    setAvailableFieldDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setViewObjectMetadataId,
  };
};
