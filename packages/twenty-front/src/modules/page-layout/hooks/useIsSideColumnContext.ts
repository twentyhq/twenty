import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from 'twenty-ui/utilities';

type UseIsSideColumnContextReturn = {
  isInPinnedTab: boolean;
  isMobile: boolean;
  isSideColumnContext: boolean;
};

export const useIsSideColumnContext = (): UseIsSideColumnContextReturn => {
  const { isInPinnedTab } = useIsInPinnedTab();
  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();

  return {
    isInPinnedTab,
    isMobile,
    isSideColumnContext: isInPinnedTab || isMobile || isInSidePanel,
  };
};
