import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';

export const useClearVectorSearchInput = () => {
  const [, setVectorSearchInputValue] = useRecoilComponentStateV2(
    vectorSearchInputComponentState,
  );

  const clearVectorSearchInput = () => {
    setVectorSearchInputValue('');
  };

  return {
    clearVectorSearchInput,
  };
};
