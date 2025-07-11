import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';

export const useClearVectorSearchInput = () => {
  const setVectorSearchInputValue = useSetRecoilComponentStateV2(
    vectorSearchInputComponentState,
  );

  const clearVectorSearchInput = () => {
    setVectorSearchInputValue('');
  };

  return {
    clearVectorSearchInput,
  };
};
