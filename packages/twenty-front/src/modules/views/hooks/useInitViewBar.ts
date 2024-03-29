import { useSetRecoilState } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';

export const useInitViewBar = (viewBarComponentId?: string) => {
  const {
    availableFieldDefinitionsState,
    availableSortDefinitionsState,
    availableFilterDefinitionsState,
    viewObjectMetadataIdState,
  } = useViewStates(viewBarComponentId);

  const setAvailableFieldDefinitions = useSetRecoilState(
    availableFieldDefinitionsState,
  );
  const setAvailableSortDefinitions = useSetRecoilState(
    availableSortDefinitionsState,
  );
  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState,
  );

  const setViewObjectMetadataId = useSetRecoilState(viewObjectMetadataIdState);

  return {
    setAvailableFieldDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setViewObjectMetadataId,
  };
};
