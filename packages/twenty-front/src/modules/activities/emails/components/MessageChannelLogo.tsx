import { AppChip } from '@/applications/components/AppChip';
import { useMessageChannelLabel } from '@/activities/emails/hooks/useMessageChannelLabel';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';
import { type TimelineThreadChannel } from '~/generated/graphql';

const StyledLogo = styled.span`
  display: flex;
`;

type MessageChannelLogoProps = {
  channel:
    | Pick<TimelineThreadChannel, 'type' | 'provider' | 'applicationId'>
    | null
    | undefined;
};

export const MessageChannelLogo = ({ channel }: MessageChannelLogoProps) => {
  const theme = useTheme();
  const { getMessageChannelLabel } = useMessageChannelLabel();

  const applicationId = channel?.applicationId;

  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    ({ provider }) => provider === channel?.provider,
  );

  const title = getMessageChannelLabel(channel);

  const BuiltInLogo = builtInAccountApp?.Icon ?? IconMail;

  return (
    <Tooltip content={title}>
      <StyledLogo role="img" aria-label={title}>
        {isDefined(applicationId) ? (
          <AppChip applicationId={applicationId} chipOnly />
        ) : (
          <BuiltInLogo size={theme.icon.size.md} />
        )}
      </StyledLogo>
    </Tooltip>
  );
};
