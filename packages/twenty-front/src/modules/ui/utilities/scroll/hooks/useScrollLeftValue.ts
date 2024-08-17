import { useScrollStates } from '@/ui/utilities/scroll/hooks/internal/useScrollStates';
import { useRecoilValue } from 'recoil';

export const useScrollLeftValue = (contextProviderName: string) => {
  const { scrollLeftComponentState } = useScrollStates(contextProviderName);
  return useRecoilValue(scrollLeftComponentState);
};
