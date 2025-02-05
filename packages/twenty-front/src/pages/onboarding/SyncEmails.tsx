import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { ActionLink, IconGoogle, IconMicrosoft, MainButton } from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingSyncEmailsSettingsCard } from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { AppPath } from '@/types/AppPath';
import { ConnectedAccountProvider } from 'twenty-shared';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  OnboardingStatus,
  useSkipSyncEmailOnboardingStepMutation,
} from '~/generated/graphql';

const StyledSyncEmailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)} 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledActionLinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: ${({ theme }) => theme.spacing(3)} 0 0;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledProviderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const SyncEmails = () => {
  const theme = useTheme();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useRecoilValue(currentUserState);
  const [visibility, setVisibility] = useState<MessageChannelVisibility>(
    MessageChannelVisibility.SHARE_EVERYTHING,
  );
  const [skipSyncEmailOnboardingStatusMutation] =
    useSkipSyncEmailOnboardingStepMutation();

  const handleButtonClick = async (provider: ConnectedAccountProvider) => {
    const calendarChannelVisibility =
      visibility === MessageChannelVisibility.SHARE_EVERYTHING
        ? CalendarChannelVisibility.SHARE_EVERYTHING
        : CalendarChannelVisibility.METADATA;

    await triggerApisOAuth(provider, {
      redirectLocation: AppPath.Index,
      messageVisibility: visibility,
      calendarVisibility: calendarChannelVisibility,
    });
  };

  const continueWithoutSync = async () => {
    await skipSyncEmailOnboardingStatusMutation();
    setNextOnboardingStatus();
  };

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

  const isGoogleProviderEnabled =
    isGoogleMessagingEnabled || isGoogleCalendarEnabled;
  const isMicrosoftProviderEnabled =
    isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled;

  useScopedHotkeys(
    [Key.Enter],
    async () => {
      await continueWithoutSync();
    },
    PageHotkeyScope.SyncEmail,
    [continueWithoutSync],
  );

  if (currentUser?.onboardingStatus !== OnboardingStatus.SYNC_EMAIL) {
    return <></>;
  }

  return (
    <>
      <Title noMarginTop>Emails and Calendar</Title>
      <SubTitle>
        Sync your Emails and Calendar with Twenty. Choose your privacy settings.
      </SubTitle>
      <StyledSyncEmailsContainer>
        <OnboardingSyncEmailsSettingsCard
          value={visibility}
          onChange={setVisibility}
        />
      </StyledSyncEmailsContainer>
      <StyledProviderContainer>
        {isGoogleProviderEnabled && (
          <MainButton
            title="Sync with Google"
            onClick={() => handleButtonClick(ConnectedAccountProvider.GOOGLE)}
            width={200}
            Icon={() => <IconGoogle size={theme.icon.size.sm} />}
          />
        )}
        {isMicrosoftProviderEnabled && (
          <MainButton
            title="Sync with Outlook"
            onClick={() =>
              handleButtonClick(ConnectedAccountProvider.MICROSOFT)
            }
            width={200}
            Icon={() => <IconMicrosoft size={theme.icon.size.sm} />}
          />
        )}
        {!isMicrosoftProviderEnabled && !isGoogleProviderEnabled && (
          <MainButton
            title="Continue"
            onClick={continueWithoutSync}
            width={144}
          />
        )}
      </StyledProviderContainer>
      <StyledActionLinkContainer>
        <ActionLink onClick={continueWithoutSync}>
          Continue without sync
        </ActionLink>
      </StyledActionLinkContainer>
    </>
  );
};
