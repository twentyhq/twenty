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

import { GranolaFolderSection } from 'src/front-components/components/GranolaFolderSection';
import { GranolaImportHistorySection } from 'src/front-components/components/GranolaImportHistorySection';
import { GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH } from 'src/constants/granola-webhook-registration-route-path';
import { GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH } from 'src/constants/granola-webhook-removal-route-path';
import { GranolaConnectionSection } from 'src/front-components/components/GranolaConnectionSection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { fetchGranolaConnectionStatusOrThrow } from 'src/front-components/utils/fetch-granola-connection-status-or-throw.util';
import { isGranolaConnectionReady } from 'src/front-components/utils/is-granola-connection-ready.util';
import { postGranolaSettingsRouteOrThrow } from 'src/front-components/utils/post-granola-settings-route-or-throw.util';
import { setGranolaApiKeyOrThrow } from 'src/front-components/utils/set-granola-api-key-or-throw.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;

  button svg {
    pointer-events: none;
  }
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
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | undefined>();
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
      setRegistrationError(t('Could not connect to Granola. Try again.'));
      setState((current) =>
        current.step === 'ready' ? current : { step: 'unavailable' },
      );

      return undefined;
    }
  };

  const registerLiveSync = async () => {
    setIsRegistering(true);
    setRegistrationError(undefined);

    try {
      await postGranolaSettingsRouteOrThrow({
        routePath: GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH,
        body: {},
      });
    } catch {
      setRegistrationError(t('Could not connect to Granola. Try again.'));
    }

    await refreshConnectionStatus();
    setIsRegistering(false);
  };

  const loadConnectionStatus = async () => {
    setIsRegistering(true);
    setRegistrationError(undefined);
    const status = await refreshConnectionStatus();

    if (isDefined(status) && shouldSetUpLiveSync(status)) {
      await registerLiveSync();
    }
    setIsRegistering(false);
  };

  const handleConnect = async (apiKey: string): Promise<boolean> => {
    setIsConnecting(true);
    setConnectError(undefined);

    try {
      await setGranolaApiKeyOrThrow({ frontComponentId, apiKey });
    } catch {
      setConnectError(t('Could not save the API key. Try again.'));
      setIsConnecting(false);

      return false;
    }

    await loadConnectionStatus();
    setIsConnecting(false);

    return true;
  };

  // Deleting the endpoint needs the key that created it, so the webhook goes
  // before the variable is cleared.
  const handleRemove = async () => {
    setIsRemoving(true);
    setRemoveError(undefined);

    try {
      await postGranolaSettingsRouteOrThrow({
        routePath: GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH,
        body: {},
      });
      await setGranolaApiKeyOrThrow({ frontComponentId, apiKey: '' });
      setConnectError(undefined);
      setRegistrationError(undefined);
    } catch {
      setRemoveError(t('Could not remove the API key. Try again.'));
    }

    await refreshConnectionStatus();
    setIsRemoving(false);
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
              isConnecting={isConnecting || isRegistering}
              isRemoving={isRemoving}
              connectError={connectError ?? registrationError}
              removeError={removeError}
              onConnect={handleConnect}
              onRemove={handleRemove}
              onRetry={
                state.status.isConnected && state.status.canManage
                  ? registerLiveSync
                  : loadConnectionStatus
              }
            />
            {state.status.canManage &&
              isGranolaConnectionReady(state.status) &&
              !isConnecting &&
              !isRegistering &&
              !isDefined(registrationError) && (
                <>
                  <GranolaFolderSection />
                  <GranolaImportHistorySection />
                </>
              )}
          </>
        )}
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
