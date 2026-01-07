import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { OnboardingSyncEmailsSettingsCard } from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';

import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { PageFocusId } from '@/types/PageFocusId';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  useSkipSyncEmailOnboardingStepMutation,
} from '~/generated-metadata/graphql';

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

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: async () => {
      await continueWithoutSync();
    },
    focusId: PageFocusId.SyncEmail,
    dependencies: [continueWithoutSync],
  });

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <Title noMarginTop>{t`Emails and Calendar`}</Title>
      <SubTitle>
        {t`Sync your Emails and Calendar with Twenty. Choose your privacy settings.`}
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
            title={t`Sync with Google`}
            onClick={() => handleButtonClick(ConnectedAccountProvider.GOOGLE)}
            width={200}
            Icon={() => <IconGoogle size={theme.icon.size.sm} />}
          />
        )}
        {isMicrosoftProviderEnabled && (
          <MainButton
            title={t`Sync with Outlook`}
            onClick={() =>
              handleButtonClick(ConnectedAccountProvider.MICROSOFT)
            }
            width={200}
            Icon={() => <IconMicrosoft size={theme.icon.size.sm} />}
          />
        )}
        {!isMicrosoftProviderEnabled && !isGoogleProviderEnabled && (
          <MainButton
            title={t`Continue`}
            onClick={continueWithoutSync}
            width={144}
          />
        )}
      </StyledProviderContainer>
      <StyledActionLinkContainer>
        <ClickToActionLink onClick={continueWithoutSync}>
          {t`Continue without sync`}
        </ClickToActionLink>
      </StyledActionLinkContainer>
    </Modal.Content>
  );
};
