import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { IconGoogle } from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { OnboardingSyncEmailsSettingsCard } from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { AppPath } from '@/types/AppPath';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
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
  const navigate = useNavigate();
  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();
  const setIsCurrentUserLoaded = useSetRecoilState(isCurrentUserLoadedState);
  const [visibility, setVisibility] = useState<MessageChannelVisibility>(
    MessageChannelVisibility.ShareEverything,
  );
  const [skipSyncEmailOnboardingStepMutation] =
    useSkipSyncEmailOnboardingStepMutation();

  const handleButtonClick = async () => {
    const calendarChannelVisibility =
      visibility === MessageChannelVisibility.ShareEverything
        ? CalendarChannelVisibility.ShareEverything
        : CalendarChannelVisibility.Metadata;

    await triggerGoogleApisOAuth(
      AppPath.Index,
      visibility,
      calendarChannelVisibility,
    );
  };

  const continueWithoutSync = async () => {
    await skipSyncEmailOnboardingStepMutation();
    setIsCurrentUserLoaded(false);
    navigate(AppPath.Index);
  };

  const isSubmitting = false;

  return (
    <>
      <Title withMarginTop={false}>Emails and Calendar</Title>
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
        disabled={isSubmitting}
      />
      <StyledActionLinkContainer>
        <ActionLink onClick={continueWithoutSync}>
          Continue without sync
        </ActionLink>
      </StyledActionLinkContainer>
    </>
  );
};
