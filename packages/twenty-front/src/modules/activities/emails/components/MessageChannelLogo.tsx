import { AppChip } from '@/applications/components/AppChip';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { type TimelineThreadChannel } from '~/generated/graphql';

type MessageChannelLogoProps = {
  channel: TimelineThreadChannel | null | undefined;
};

export const MessageChannelLogo = ({ channel }: MessageChannelLogoProps) => {
  const theme = useTheme();

  const applicationId = channel?.applicationId;

  if (isDefined(applicationId)) {
    return <AppChip applicationId={applicationId} chipOnly />;
  }

  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    ({ provider }) => provider === channel?.provider,
  );

  const Logo = builtInAccountApp?.Icon ?? IconMail;

  return <Logo size={theme.icon.size.md} />;
};
