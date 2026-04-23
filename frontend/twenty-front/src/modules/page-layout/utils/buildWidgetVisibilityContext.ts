import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInSidePanel,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
  };
};
