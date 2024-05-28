import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconGoogle } from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import {
  InboxSyncEmailsValue,
  OnboardingSyncEmailsSettingsCard,
} from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink';

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
  const handleVisibilityChange = (value: InboxSyncEmailsValue) => {
    console.log('handleVisibilityChange', value);
  };

  const handleButtonClick = () => {
    console.log('handleButtonClick');
  };

  const continueWithoutSync = () => {
    console.log('continueWithoutSync');
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
          value={undefined}
          onChange={handleVisibilityChange}
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
