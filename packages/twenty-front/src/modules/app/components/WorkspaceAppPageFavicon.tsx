import { useTheme } from 'twenty-ui/theme';

import { PageFavicon } from '@/app/components/PageFavicon';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';

export const WorkspaceAppPageFavicon = () => {
  const theme = useTheme();
  const { hasChatNeedingInput } = useNavigationMenuChatAttention();

  return (
    <PageFavicon
      attentionDotColor={hasChatNeedingInput ? theme.color.red : undefined}
    />
  );
};
