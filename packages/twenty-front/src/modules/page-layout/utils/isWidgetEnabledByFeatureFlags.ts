import { WIDGET_TYPE_REQUIRED_FEATURE_FLAG } from '@/page-layout/constants/WidgetTypeRequiredFeatureFlag';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';

type IsWidgetEnabledByFeatureFlagsParams = {
  widget: Pick<PageLayoutWidget, 'type'>;
  featureFlags: Record<string, boolean>;
};

// Feature flags describe what the workspace has, not what one viewer sees, so
// unlike device or record conditions they also apply while a layout is edited.
export const isWidgetEnabledByFeatureFlags = ({
  widget,
  featureFlags,
}: IsWidgetEnabledByFeatureFlagsParams): boolean => {
  const requiredFeatureFlag = WIDGET_TYPE_REQUIRED_FEATURE_FLAG[widget.type];

  if (isDefined(requiredFeatureFlag) && !featureFlags[requiredFeatureFlag]) {
    return false;
  }

  return true;
};
