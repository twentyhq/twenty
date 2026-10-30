import { getMessageChannelLogo } from '@/activities/emails/utils/getMessageChannelLogo';
import { useTheme } from 'twenty-ui/theme';
import { type TimelineThreadChannel } from '~/generated/graphql';

type MessageChannelLogoProps = {
  channel: TimelineThreadChannel | null | undefined;
};

export const MessageChannelLogo = ({ channel }: MessageChannelLogoProps) => {
  const theme = useTheme();
  const Logo = getMessageChannelLogo(channel);

  return <Logo size={theme.icon.size.sm} />;
};
