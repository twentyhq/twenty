import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { ActionLink, IconGoogle, MainButton } from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingSyncEmailsSettingsCard } from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { AppPath } from '@/types/AppPath';
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
`;

export const SyncEmails = () => {
  const theme = useTheme();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useRecoilValue(currentUserState);
  const [visibility, setVisibility] = useState<MessageChannelVisibility>(
    MessageChannelVisibility.ShareEverything,
  );
  const [skipSyncEmailOnboardingStatusMutation] =
    useSkipSyncEmailOnboardingStepMutation();

  const handleButtonClick = async () => {
    const calendarChannelVisibility =
      visibility === MessageChannelVisibility.ShareEverything
        ? CalendarChannelVisibility.ShareEverything
        : CalendarChannelVisibility.Metadata;

    await triggerApisOAuth('google', {
      redirectLocation: AppPath.Index,
      messageVisibility: visibility,
      calendarVisibility: calendarChannelVisibility,
    });
  };

  const continueWithoutSync = async () => {
    await skipSyncEmailOnboardingStatusMutation();
    setNextOnboardingStatus();
  };

  useScopedHotkeys(
    [Key.Enter],
    async () => {
      await continueWithoutSync();
    },
    PageHotkeyScope.SyncEmail,
    [continueWithoutSync],
  );

  if (currentUser?.onboardingStatus !== OnboardingStatus.SyncEmail) {
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
      <MainButton
        title="Sync with Google"
        onClick={handleButtonClick}
        width={200}
        Icon={() => <IconGoogle size={theme.icon.size.sm} />}
      />
      <StyledActionLinkContainer>
        <ActionLink onClick={continueWithoutSync}>
          Continue without sync
        </ActionLink>
      </StyledActionLinkContainer>
    </>
  );
};
