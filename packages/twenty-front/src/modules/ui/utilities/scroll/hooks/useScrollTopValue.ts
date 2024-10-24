import { ContextProviderName } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useScrollStates } from '@/ui/utilities/scroll/hooks/internal/useScrollStates';
import { useRecoilValue } from 'recoil';

export const useScrollTopValue = (contextProviderName: ContextProviderName) => {
  const { scrollTopComponentState } = useScrollStates(contextProviderName);
  return useRecoilValue(scrollTopComponentState);
};
