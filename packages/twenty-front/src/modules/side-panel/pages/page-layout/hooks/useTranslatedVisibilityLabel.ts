import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { getWidgetVisibilityDevice } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityDevice';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useTranslatedVisibilityLabel = (
  widget:
    | Pick<
        PageLayoutWidget,
        'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined,
): string => {
  const visibilityLabels = useVisibilityLabels();
  const isWidgetConditionalAvailabilityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED,
  );

  return visibilityLabels[
    getWidgetVisibilityDevice({
      widget,
      isWidgetConditionalAvailabilityEnabled,
    })
  ];
};
