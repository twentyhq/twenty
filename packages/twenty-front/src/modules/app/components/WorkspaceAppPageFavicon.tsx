import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { PageFavicon } from '@/app/components/PageFavicon';
import { useNavigationDrawerAttention } from '@/navigation/hooks/useNavigationDrawerAttention';

export const WorkspaceAppPageFavicon = () => {
  const theme = useTheme();
  const { navigationDrawerAttention } = useNavigationDrawerAttention();

  const attentionDotColorByAttention = {
    'needs-input': theme.color.red,
    unread: theme.font.color.tertiary,
  };

  return (
    <PageFavicon
      attentionDotColor={
        isDefined(navigationDrawerAttention)
          ? attentionDotColorByAttention[navigationDrawerAttention]
          : undefined
      }
    />
  );
};
