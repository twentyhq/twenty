import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconAt, IconGoogle, IconMicrosoft } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAccountsListEmptyStateCard = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const { t } = useLingui();
  const theme = useTheme();

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
    <StyledCardsContainer>
      {(isGoogleMessagingEnabled || isGoogleCalendarEnabled) && (
        <SettingsCard
          Icon={<IconGoogle size={theme.icon.size.md} />}
          title={t`Connect with Google`}
          onClick={() => triggerApisOAuth(ConnectedAccountProvider.GOOGLE)}
        />
      )}

      {(isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled) && (
        <SettingsCard
          Icon={<IconMicrosoft size={theme.icon.size.md} />}
          title={t`Connect with Microsoft`}
          onClick={() => triggerApisOAuth(ConnectedAccountProvider.MICROSOFT)}
        />
      )}

      {isImapSmtpCaldavFeatureFlagEnabled && (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection)}
        >
          <SettingsCard
            Icon={<IconAt size={theme.icon.size.md} />}
            title={t`Connect Email Account`}
          />
        </UndecoratedLink>
      )}
    </StyledCardsContainer>
  );
};
