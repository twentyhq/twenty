import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';
import { isDefined } from 'twenty-shared/utils';

type IsPageLayoutTabHiddenByFeatureFlagsParams = {
  tabId: string;
  persistedTabs: Pick<PageLayoutTab, 'id' | 'widgets'>[] | undefined;
  featureFlags: Record<string, boolean>;
};

// A tab only flag-gated widgets fill goes with them, while one left empty on
// purpose stays so it can still be filled. Tabs are judged as loaded, so an
// edit that leaves one with only flag-gated widgets cannot make it vanish, and
// a tab created during the edit, even a copy holding some, was visible then.
export const isPageLayoutTabHiddenByFeatureFlags = ({
  tabId,
  persistedTabs,
  featureFlags,
}: IsPageLayoutTabHiddenByFeatureFlagsParams): boolean => {
  const persistedTab = persistedTabs?.find((tab) => tab.id === tabId);

  if (!isDefined(persistedTab)) {
    return false;
  }

  return (
    persistedTab.widgets.length > 0 &&
    persistedTab.widgets.every(
      (widget) => !isWidgetEnabledByFeatureFlags({ widget, featureFlags }),
    )
  );
};
