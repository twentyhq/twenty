import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { GettingStartedConnectedAccountsTable } from '@/getting-started/components/GettingStartedConnectedAccountsTable';
import { useGettingStartedMailboxAccounts } from '@/getting-started/hooks/useGettingStartedMailboxAccounts';
import { OnboardingImportPreview } from '@/onboarding/components/import-contacts/OnboardingImportPreview';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledProviderButtons = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

export const GettingStartedMailboxAction = () => {
  const { t } = useLingui();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts, hasLoaded } = useGettingStartedMailboxAccounts();
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const connectMailbox = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: AppPath.GettingStarted,
      messageVisibility: MessageChannelVisibility.METADATA,
      calendarVisibility: CalendarChannelVisibility.METADATA,
      skipMessageChannelConfiguration: true,
    });

  if (!hasLoaded) {
    return null;
  }

  if (accounts.length > 0) {
    return <GettingStartedConnectedAccountsTable accounts={accounts} />;
  }

  return (
    <StyledColumn>
      <OnboardingImportPreview
        privacyNote={t`Teammates see who you talk to, not what you write.`}
      />
      <StyledProviderButtons>
        <Button
          fullWidth
          disabled={!isGoogleMessagingEnabled}
          startIcon={<IconGoogle />}
          onClick={() => void connectMailbox(ConnectedAccountProvider.GOOGLE)}
        >{t`Continue with Google`}</Button>
        <Button
          fullWidth
          disabled={!isMicrosoftMessagingEnabled}
          startIcon={<IconMicrosoft />}
          onClick={() =>
            void connectMailbox(ConnectedAccountProvider.MICROSOFT)
          }
        >{t`Continue with Microsoft`}</Button>
      </StyledProviderButtons>
    </StyledColumn>
  );
};
