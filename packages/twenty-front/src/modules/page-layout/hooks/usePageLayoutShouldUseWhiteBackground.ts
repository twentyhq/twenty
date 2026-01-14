import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { PageLayoutType } from '~/generated/graphql';

export const usePageLayoutShouldUseWhiteBackground = () => {
  const isMobile = useIsMobile();
  const { isInRightDrawer, layoutType } = useLayoutRenderingContext();

  const shouldUseWhiteBackground =
    layoutType === PageLayoutType.RECORD_PAGE && (isMobile || isInRightDrawer);

  return { shouldUseWhiteBackground };
};
