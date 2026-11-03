import { AppChip } from '@/applications/components/AppChip';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';
import { type TimelineThreadChannel } from '~/generated/graphql';

const StyledLogo = styled.span`
  display: flex;
`;

type MessageChannelLogoProps = {
  channel: TimelineThreadChannel | null | undefined;
};

export const MessageChannelLogo = ({ channel }: MessageChannelLogoProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const applicationId = channel?.applicationId;

  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    ({ provider }) => provider === channel?.provider,
  );

  const title = isDefined(applicationId)
    ? getInstalledApplicationDisplayName({ applicationId, currentWorkspace })
    : isDefined(builtInAccountApp)
      ? t(builtInAccountApp.name)
      : t`Email`;

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
