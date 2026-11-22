import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { getWidgetVisibilityDevice } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityDevice';

export const useTranslatedVisibilityLabel = (
  widget:
    | Pick<
        PageLayoutWidget,
        'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined,
): string => {
  const visibilityLabels = useVisibilityLabels();

  return visibilityLabels[getWidgetVisibilityDevice(widget)];
};
