import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';

export const useExitVectorSearchInput = () => {
  const [, setVectorSearchInputValue] = useRecoilComponentStateV2(
    vectorSearchInputComponentState,
  );

  const exitVectorSearchInput = () => {
    setVectorSearchInputValue('');
  };

  return {
    exitVectorSearchInput,
  };
};
