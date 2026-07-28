import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInSidePanel: boolean;
  selectedRecords?: Record<string, unknown>[];
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInSidePanel,
  selectedRecords = [],
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
    selectedRecords,
  };
};
