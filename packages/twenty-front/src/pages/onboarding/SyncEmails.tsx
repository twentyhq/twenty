import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { isOnboardingV2EnabledState } from '@/client-config/states/isOnboardingV2EnabledState';
import { OnboardingSyncEmailsSettingsCard } from '@/onboarding/components/OnboardingSyncEmailsSettingsCard';
import { useSyncEmailsOnboarding } from '@/onboarding/hooks/useSyncEmailsOnboarding';

import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconGoogle, IconMicrosoft } from 'twenty-ui-deprecated/display';
import { MainButton } from 'twenty-ui-deprecated/input';
import { ModalContent } from 'twenty-ui-deprecated/layout';
import { ClickToActionLink } from 'twenty-ui-deprecated/navigation';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { SyncEmailsV2 } from './SyncEmailsV2';

const StyledSyncEmailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  margin: ${themeCssVariables.spacing[8]} 0;
  width: 100%;
`;

const StyledActionLinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: ${themeCssVariables.spacing[3]} 0 0;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledProviderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const SyncEmailsV1 = () => {
  const { theme } = useContext(ThemeContext);
  const {
    visibility,
    setVisibility,
    userAuthenticatedWithSSO,
    isGoogleProviderEnabled,
    isMicrosoftProviderEnabled,
    syncWithProvider,
    continueWithoutSync,
  } = useSyncEmailsOnboarding();

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: async () => {
      await continueWithoutSync();
    },
    focusId: PageFocusId.SyncEmail,
    dependencies: [continueWithoutSync],
  });

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
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
        {!userAuthenticatedWithSSO && isGoogleProviderEnabled && (
          <MainButton
            title={t`Sync with Google`}
            onClick={() => syncWithProvider(ConnectedAccountProvider.GOOGLE)}
            width={200}
            Icon={() => <IconGoogle size={theme.icon.size.sm} />}
          />
        )}
        {!userAuthenticatedWithSSO && isMicrosoftProviderEnabled && (
          <MainButton
            title={t`Sync with Outlook`}
            onClick={() => syncWithProvider(ConnectedAccountProvider.MICROSOFT)}
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
        {userAuthenticatedWithSSO && isMicrosoftProviderEnabled && (
          <MainButton
            title={t`Continue`}
            onClick={() => syncWithProvider(ConnectedAccountProvider.MICROSOFT)}
            width={144}
          />
        )}
        {userAuthenticatedWithSSO && isGoogleProviderEnabled && (
          <MainButton
            title={t`Continue`}
            onClick={() => syncWithProvider(ConnectedAccountProvider.GOOGLE)}
            width={144}
          />
        )}
      </StyledProviderContainer>
      <StyledActionLinkContainer>
        <ClickToActionLink onClick={continueWithoutSync}>
          {t`Continue without sync`}
        </ClickToActionLink>
      </StyledActionLinkContainer>
    </ModalContent>
  );
};

export const SyncEmails = () => {
  const isOnboardingV2Enabled = useAtomStateValue(isOnboardingV2EnabledState);

  return isOnboardingV2Enabled ? <SyncEmailsV2 /> : <SyncEmailsV1 />;
};
