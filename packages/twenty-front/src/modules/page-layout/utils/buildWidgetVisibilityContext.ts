import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type BuildWidgetVisibilityContextParams = {
  isMobile: boolean;
  isInSidePanel: boolean;
  recordFieldValues?: Record<string, unknown>;
};

export const buildWidgetVisibilityContext = ({
  isMobile,
  isInSidePanel,
  recordFieldValues,
}: BuildWidgetVisibilityContextParams): WidgetVisibilityContext => {
  return {
    device: isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP',
    record: recordFieldValues,
  };
};
