import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconAt, IconGoogle, IconMicrosoft } from 'twenty-ui/display';
import { Card, CardContent, CardHeader } from 'twenty-ui/layout';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLink = styled(Link)`
  text-decoration: none;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

type SettingsAccountsListEmptyStateCardProps = {
  label?: string;
};

export const SettingsAccountsListEmptyStateCard = ({
  label,
}: SettingsAccountsListEmptyStateCardProps) => {
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const { t } = useLingui();

  const isGoogleMessagingEnabled = useRecoilValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useRecoilValue(
    isMicrosoftMessagingEnabledState,
  );

  const isGoogleCalendarEnabled = useRecoilValue(isGoogleCalendarEnabledState);

  const isMicrosoftCalendarEnabled = useRecoilValue(
    isMicrosoftCalendarEnabledState,
  );

  const isImapSmtpCaldavFeatureFlagEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_IMAP_SMTP_CALDAV_ENABLED,
  );

  return (
    <Card>
      <StyledHeader>{label || t`No connected account`}</StyledHeader>
      <StyledBody>
        {(isGoogleMessagingEnabled || isGoogleCalendarEnabled) && (
          <SettingsCard
            Icon={<IconGoogle />}
            title={t`Connect with Google`}
            onClick={() => triggerApisOAuth(ConnectedAccountProvider.GOOGLE)}
          />
        )}

        {(isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled) && (
          <SettingsCard
            Icon={<IconMicrosoft />}
            title={t`Connect with Microsoft`}
            onClick={() => triggerApisOAuth(ConnectedAccountProvider.MICROSOFT)}
          />
        )}

        {isImapSmtpCaldavFeatureFlagEnabled && (
          <StyledLink
            to={getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection)}
          >
            <SettingsCard Icon={<IconAt />} title={t`Connect Email Account`} />
          </StyledLink>
        )}
      </StyledBody>
    </Card>
  );
};
