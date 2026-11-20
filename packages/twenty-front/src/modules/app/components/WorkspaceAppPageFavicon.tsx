import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { PageFavicon } from '@/app/components/PageFavicon';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkspaceAppPageFavicon = () => {
  const theme = useTheme();
  const { chatAttention } = useNavigationMenuChatAttention();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const attentionDotColorByChatAttention = {
    'needs-input': theme.color.red,
    unread: theme.font.color.tertiary,
  };

  return (
    <PageFavicon
      attentionDotColor={
        isCustomizableSidebarEnabled && isDefined(chatAttention)
          ? attentionDotColorByChatAttention[chatAttention]
          : undefined
      }
    />
  );
};
