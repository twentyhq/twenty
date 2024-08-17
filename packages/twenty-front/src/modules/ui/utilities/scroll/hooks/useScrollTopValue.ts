import { useScrollStates } from '@/ui/utilities/scroll/hooks/internal/useScrollStates';
import { useRecoilValue } from 'recoil';

export const useScrollTopValue = (contextProviderName: string) => {
  const { scrollTopComponentState } = useScrollStates(contextProviderName);
  return useRecoilValue(scrollTopComponentState);
};
