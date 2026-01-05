import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useShouldUseWhiteBackground = () => {
  const isMobile = useIsMobile();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const { isInPinnedTab } = useIsInPinnedTab();

  const shouldUseWhiteBackground =
    (isMobile || isInRightDrawer) && !isInPinnedTab;

  return { shouldUseWhiteBackground };
};
