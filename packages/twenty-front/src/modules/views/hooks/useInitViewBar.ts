import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { availableFieldDefinitionsComponentState } from '@/views/states/availableFieldDefinitionsComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';

export const useInitViewBar = (viewBarInstanceId?: string) => {
  const setAvailableFieldDefinitions = useSetAtomComponentState(
    availableFieldDefinitionsComponentState,
    viewBarInstanceId,
  );

  const setViewObjectMetadataId = useSetAtomComponentState(
    viewObjectMetadataIdComponentState,
    viewBarInstanceId,
  );

  return {
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
  };
};
