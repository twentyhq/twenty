import { useTheme } from 'twenty-ui/theme';

import { PageFavicon } from '@/app/components/PageFavicon';
import { useHasVisibleSidebarRedNotification } from '@/navigation/hooks/useHasVisibleSidebarRedNotification';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkspaceAppPageFavicon = () => {
  const theme = useTheme();
  const hasVisibleSidebarRedNotification =
    useHasVisibleSidebarRedNotification();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  return (
    <PageFavicon
      attentionDotColor={
        isCustomizableSidebarEnabled && hasVisibleSidebarRedNotification
          ? theme.color.red
          : undefined
      }
    />
  );
};
