import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { conditionalAvailabilityToOptionId } from '@/side-panel/pages/page-layout/utils/conditionalAvailabilityToOptionId';

export const useTranslatedVisibilityLabel = (
  widget: PageLayoutWidget | undefined,
): string => {
  const visibilityLabels = useVisibilityLabels();

  return visibilityLabels[
    conditionalAvailabilityToOptionId(widget?.conditionalAvailability)
  ];
};
