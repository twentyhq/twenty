import { ContextProviderName } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useScrollStates } from '@/ui/utilities/scroll/hooks/internal/useScrollStates';
import { useRecoilValue } from 'recoil';

export const useScrollLeftValue = (
  contextProviderName: ContextProviderName,
) => {
  const { scrollLeftComponentState } = useScrollStates(contextProviderName);
  return useRecoilValue(scrollLeftComponentState);
};
