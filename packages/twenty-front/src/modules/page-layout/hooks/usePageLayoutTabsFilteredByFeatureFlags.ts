import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { filterPageLayoutTabsByFeatureFlags } from '@/page-layout/utils/filterPageLayoutTabsByFeatureFlags';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const usePageLayoutTabsFilteredByFeatureFlags = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isNativeCallRecordingTabsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NATIVE_CALL_RECORDING_TABS_ENABLED,
  );

  const featureFilteredPageLayoutTabs = filterPageLayoutTabsByFeatureFlags({
    tabs: currentPageLayout.tabs,
    isNativeCallRecordingTabsEnabled,
  });

  return { featureFilteredPageLayoutTabs };
};
