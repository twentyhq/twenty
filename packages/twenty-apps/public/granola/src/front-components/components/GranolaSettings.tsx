import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { useState } from 'react';
import {
  t,
  useColorScheme,
  useFrontComponentId,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';

import { GranolaConnectionSection } from 'src/front-components/components/GranolaConnectionSection';
import { GranolaLiveSyncSection } from 'src/front-components/components/GranolaLiveSyncSection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { fetchGranolaConnectionStatusOrThrow } from 'src/front-components/utils/fetch-granola-connection-status-or-throw.util';
import { registerGranolaWebhookOrThrow } from 'src/front-components/utils/register-granola-webhook-or-throw.util';
import { saveGranolaApiKeyOrThrow } from 'src/front-components/utils/save-granola-api-key-or-throw.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledNotice = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  line-height: ${() => themeCssVariables.text.lineHeight.md};
`;

type GranolaSettingsState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; status: GranolaConnectionStatus };

const shouldSetUpLiveSync = (status: GranolaConnectionStatus) =>
  status.isConnected &&
  status.canManage &&
  status.needsRegistration &&
  !isDefined(status.registration);

export const GranolaSettings = () => {
  const colorScheme = useColorScheme();
  const frontComponentId = useFrontComponentId();
  const [state, setState] = useState<GranolaSettingsState>({ step: 'loading' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | undefined>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<
    string | undefined
  >();

  const refreshConnectionStatus = async () => {
    try {
      const status = await fetchGranolaConnectionStatusOrThrow();

      setState({ step: 'ready', status });

      return status;
    } catch {
      setState({ step: 'unavailable' });

      return undefined;
    }
  };

  const registerLiveSync = async () => {
    setIsRegistering(true);
    setRegistrationError(undefined);

    try {
      await registerGranolaWebhookOrThrow();
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : t('Could not set up live sync. Try again.'),
      );
    }

    await refreshConnectionStatus();
    setIsRegistering(false);
  };

  const loadConnectionStatus = async () => {
    const status = await refreshConnectionStatus();

    if (isDefined(status) && shouldSetUpLiveSync(status)) {
      await registerLiveSync();
    }
  };

  const handleConnect = async (apiKey: string): Promise<boolean> => {
    setIsConnecting(true);
    setConnectError(undefined);

    try {
      await saveGranolaApiKeyOrThrow({ frontComponentId, apiKey });
    } catch {
      setConnectError(t('Could not save the API key. Try again.'));
      setIsConnecting(false);

      return false;
    }

    await loadConnectionStatus();
    setIsConnecting(false);

    return true;
  };

  // twenty-ui components read icon sizes off ThemeContext, and the context
  // default resolves them to var() strings an SVG size attribute cannot use.
  return (
    <ThemeContext.Provider
      value={{
        theme: (colorScheme === 'dark'
          ? THEME_DARK
          : THEME_LIGHT) as unknown as ThemeType,
        colorScheme,
      }}
    >
      <StyledContainer>
        <OnMountEffect onMount={loadConnectionStatus} />
        {state.step === 'loading' && (
          <StyledNotice>{t('Checking your Granola connection…')}</StyledNotice>
        )}
        {state.step === 'unavailable' && (
          <StyledNotice>
            {t(
              'Could not load Granola settings. Reload the page to try again.',
            )}
          </StyledNotice>
        )}
        {state.step === 'ready' && (
          <>
            <GranolaConnectionSection
              status={state.status}
              isConnecting={isConnecting}
              connectError={connectError}
              onConnect={handleConnect}
              onRetry={refreshConnectionStatus}
            />
            {state.status.isConnected && !state.status.canManage && (
              <StyledNotice>
                {t(
                  'Only members who can manage applications can change live sync, folders, and imports.',
                )}
              </StyledNotice>
            )}
            {state.status.isConnected && state.status.canManage && (
              <GranolaLiveSyncSection
                status={state.status}
                isRegistering={isRegistering}
                registrationError={registrationError}
                onRegister={registerLiveSync}
              />
            )}
          </>
        )}
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
