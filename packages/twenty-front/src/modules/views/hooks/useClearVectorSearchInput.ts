import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';

export const useClearVectorSearchInput = () => {
  const setVectorSearchInputValue = useSetRecoilComponentState(
    vectorSearchInputComponentState,
  );

  const clearVectorSearchInput = () => {
    setVectorSearchInputValue('');
  };

  return {
    clearVectorSearchInput,
  };
};
