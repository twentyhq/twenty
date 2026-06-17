import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { OnboardingV2Frame } from '@/onboarding/components/OnboardingV2Frame';
import { useSyncEmailsOnboarding } from '@/onboarding/hooks/useSyncEmailsOnboarding';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { MessageChannelVisibility } from '~/generated/graphql';
import {
  IconGoogle,
  IconLock,
  IconMicrosoft,
} from 'twenty-ui-deprecated/display';
import { MainButton } from 'twenty-ui-deprecated/input';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  margin-top: ${themeCssVariables.spacing[14]};
`;

const StyledProviderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPrivacyHint = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

export const SyncEmailsV2 = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const {
    userAuthenticatedWithSSO,
    isGoogleProviderEnabled,
    isMicrosoftProviderEnabled,
    syncWithProvider,
    continueWithoutSync,
  } = useSyncEmailsOnboarding({
    defaultVisibility: MessageChannelVisibility.METADATA,
  });

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: async () => {
      await continueWithoutSync();
    },
    focusId: PageFocusId.SyncEmail,
    dependencies: [continueWithoutSync],
  });

  const hasProvider = isGoogleProviderEnabled || isMicrosoftProviderEnabled;

  return (
    <OnboardingV2Frame
      activeStep={2}
      title={<Trans>Import your contacts</Trans>}
      subtitle={
        <Trans>
          Connect your email and calendar to see your entire network instantly.
          Takes only 30 seconds.
        </Trans>
      }
    >
      <StyledForm>
        {hasProvider && (
          <StyledPrivacyHint>
            <IconLock size={theme.icon.size.sm} />
            <Trans>
              Your team won't see the content of your emails and events
            </Trans>
          </StyledPrivacyHint>
        )}
        <StyledProviderContainer>
          {!userAuthenticatedWithSSO && isMicrosoftProviderEnabled && (
            <MainButton
              title={t`Continue with Microsoft`}
              onClick={() =>
                syncWithProvider(ConnectedAccountProvider.MICROSOFT)
              }
              Icon={() => <IconMicrosoft size={theme.icon.size.sm} />}
              fullWidth
            />
          )}
          {!userAuthenticatedWithSSO && isGoogleProviderEnabled && (
            <MainButton
              title={t`Continue with Google`}
              onClick={() => syncWithProvider(ConnectedAccountProvider.GOOGLE)}
              Icon={() => <IconGoogle size={theme.icon.size.sm} />}
              fullWidth
            />
          )}
          {userAuthenticatedWithSSO && isMicrosoftProviderEnabled && (
            <MainButton
              title={t`Continue`}
              onClick={() =>
                syncWithProvider(ConnectedAccountProvider.MICROSOFT)
              }
              fullWidth
            />
          )}
          {userAuthenticatedWithSSO && isGoogleProviderEnabled && (
            <MainButton
              title={t`Continue`}
              onClick={() => syncWithProvider(ConnectedAccountProvider.GOOGLE)}
              fullWidth
            />
          )}
          <MainButton
            title={t`Skip`}
            variant="secondary"
            onClick={continueWithoutSync}
            fullWidth
          />
        </StyledProviderContainer>
      </StyledForm>
    </OnboardingV2Frame>
  );
};
