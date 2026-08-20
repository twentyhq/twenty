import { getIsSideColumnContext } from '@/page-layout/utils/getIsSideColumnContext';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from 'twenty-ui/utilities';

export const useIsSideColumnContext = (): boolean => {
  const { isInPinnedTab } = useIsInPinnedTab();
  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();

  return getIsSideColumnContext({ isInPinnedTab, isMobile, isInSidePanel });
};
