import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconAt, IconGoogle, IconMicrosoft } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAccountsListEmptyStateCard = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const { t } = useLingui();
  const theme = useTheme();

  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const isGoogleCalendarEnabled = useAtomStateValue(
    isGoogleCalendarEnabledState,
  );

  const isMicrosoftCalendarEnabled = useAtomStateValue(
    isMicrosoftCalendarEnabledState,
  );

  const isImapSmtpCaldavEnabled = useAtomStateValue(
    isImapSmtpCaldavEnabledState,
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

      {isImapSmtpCaldavEnabled && (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.NewImapSmtpCaldavConnection)}
        >
          <SettingsCard
            Icon={<IconAt size={theme.icon.size.md} />}
            title={t`Connect Account`}
          />
        </UndecoratedLink>
      )}
    </StyledCardsContainer>
  );
};
