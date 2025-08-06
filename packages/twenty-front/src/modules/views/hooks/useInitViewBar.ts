import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { availableFieldDefinitionsComponentState } from '@/views/states/availableFieldDefinitionsComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';

export const useInitViewBar = (viewBarInstanceId?: string) => {
  const setAvailableFieldDefinitions = useSetRecoilComponentState(
    availableFieldDefinitionsComponentState,
    viewBarInstanceId,
  );

  const setViewObjectMetadataId = useSetRecoilComponentState(
    viewObjectMetadataIdComponentState,
    viewBarInstanceId,
  );

  return {
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
  };
};
