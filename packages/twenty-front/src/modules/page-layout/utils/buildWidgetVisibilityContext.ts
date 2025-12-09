import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInRightDrawer: boolean;
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInRightDrawer,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInRightDrawer ? 'MOBILE' : 'DESKTOP',
  };
};
