import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';

type IsPageLayoutTabHiddenByFeatureFlagsParams = {
  tab: Pick<PageLayoutTab, 'widgets'>;
  featureFlags: Record<string, boolean>;
};

// A tab only flag-gated widgets fill goes with them, while one left empty on
// purpose stays so it can still be filled.
export const isPageLayoutTabHiddenByFeatureFlags = ({
  tab,
  featureFlags,
}: IsPageLayoutTabHiddenByFeatureFlagsParams): boolean =>
  tab.widgets.length > 0 &&
  tab.widgets.every(
    (widget) => !isWidgetEnabledByFeatureFlags({ widget, featureFlags }),
  );
