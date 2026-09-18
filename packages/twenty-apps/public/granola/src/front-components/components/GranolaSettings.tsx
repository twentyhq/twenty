import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { useState } from 'react';
import {
  enqueueSnackbar,
  t,
  useColorScheme,
  useFrontComponentId,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Info } from 'twenty-ui/feedback';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from 'twenty-ui/theme-constants';

import { GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH } from 'src/constants/granola-webhook-registration-route-path';
import { GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH } from 'src/constants/granola-webhook-removal-route-path';
import { GranolaApiKeyForm } from 'src/front-components/components/GranolaApiKeyForm';
import { GranolaConnectionCard } from 'src/front-components/components/GranolaConnectionCard';
import { GranolaConnectionSection } from 'src/front-components/components/GranolaConnectionSection';
import { GranolaDangerZoneSection } from 'src/front-components/components/GranolaDangerZoneSection';
import { GranolaFolderSection } from 'src/front-components/components/GranolaFolderSection';
import { GranolaImportHistorySection } from 'src/front-components/components/GranolaImportHistorySection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { computeGranolaConnectionState } from 'src/front-components/utils/compute-granola-connection-state.util';
import { fetchGranolaConnectionStatusOrThrow } from 'src/front-components/utils/fetch-granola-connection-status-or-throw.util';
import { postGranolaSettingsRouteOrThrow } from 'src/front-components/utils/post-granola-settings-route-or-throw.util';
import { readStoredGranolaApiKeyHint } from 'src/front-components/utils/read-stored-granola-api-key-hint.util';
import { setGranolaApiKeyOrThrow } from 'src/front-components/utils/set-granola-api-key-or-throw.util';
import { storeGranolaApiKeyHint } from 'src/front-components/utils/store-granola-api-key-hint.util';

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

type GranolaSettingsState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; status: GranolaConnectionStatus };

const shouldSetUpLiveSync = (status: GranolaConnectionStatus) =>
  status.isConnected &&
  status.needsRegistration &&
  !isDefined(status.registration);

const fetchGranolaConnectionStatusOrUndefined = async () => {
  try {
    return await fetchGranolaConnectionStatusOrThrow();
  } catch {
    return undefined;
  }
};

const registerGranolaLiveSync = async (): Promise<boolean> => {
  try {
    await postGranolaSettingsRouteOrThrow({
      routePath: GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH,
      body: {},
    });

    return true;
  } catch {
    return false;
  }
};

export const GranolaSettings = () => {
  const colorScheme = useColorScheme();
  const frontComponentId = useFrontComponentId();
  const [state, setState] = useState<GranolaSettingsState>({ step: 'loading' });
  const [isSettingUpConnection, setIsSettingUpConnection] = useState(true);
  const [hasSetupFailed, setHasSetupFailed] = useState(false);
  const [connectError, setConnectError] = useState<string | undefined>();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isApiKeyExpected] = useState(readStoredGranolaApiKeyHint);

  const showConnectionStatus = (status: GranolaConnectionStatus) => {
    storeGranolaApiKeyHint(status.isApiKeySet);
    setState({ step: 'ready', status });
  };

  const finishConnectionSetup = ({
    status,
    hasRegistrationFailed,
  }: {
    status: GranolaConnectionStatus | undefined;
    hasRegistrationFailed: boolean;
  }) => {
    if (isDefined(status)) {
      showConnectionStatus(status);
    } else {
      setState((current) =>
        current.step === 'ready' ? current : { step: 'unavailable' },
      );
    }
    setHasSetupFailed(hasRegistrationFailed || !isDefined(status));
    setIsSettingUpConnection(false);
  };

  const registerLiveSync = async () => {
    setIsSettingUpConnection(true);

    const isRegistered = await registerGranolaLiveSync();
    const status = await fetchGranolaConnectionStatusOrUndefined();

    finishConnectionSetup({ status, hasRegistrationFailed: !isRegistered });
  };

  const loadConnectionStatus = async () => {
    setIsSettingUpConnection(true);
    setState((current) =>
      current.step === 'ready' ? current : { step: 'loading' },
    );

    const status = await fetchGranolaConnectionStatusOrUndefined();

    if (isDefined(status) && shouldSetUpLiveSync(status)) {
      showConnectionStatus(status);
      await registerLiveSync();

      return;
    }

    finishConnectionSetup({ status, hasRegistrationFailed: false });
  };

  const handleConnect = async (apiKey: string) => {
    setIsSettingUpConnection(true);
    setConnectError(undefined);

    try {
      await setGranolaApiKeyOrThrow({ frontComponentId, apiKey });
    } catch {
      setConnectError(t('Could not save the API key. Try again.'));
      setIsSettingUpConnection(false);

      return;
    }

    await loadConnectionStatus();
  };

  // Deleting the endpoint needs the key that created it, so the webhook goes
  // before the variable is cleared.
  const handleRemoveApiKey = async () => {
    if (isRemoving) {
      return;
    }

    setIsRemoving(true);

    try {
      await postGranolaSettingsRouteOrThrow({
        routePath: GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH,
        body: {},
      });
      await setGranolaApiKeyOrThrow({ frontComponentId, apiKey: '' });
      setConnectError(undefined);
      setHasSetupFailed(false);
    } catch {
      enqueueSnackbar({
        message: t('Could not remove the API key. Try again.'),
        variant: 'error',
      });
    }

    const status = await fetchGranolaConnectionStatusOrUndefined();

    if (isDefined(status)) {
      showConnectionStatus(status);
    }
    setIsRemoving(false);
  };

  const status = state.step === 'ready' ? state.status : undefined;
  const connectionState = isDefined(status)
    ? computeGranolaConnectionState({
        status,
        isConnecting: isSettingUpConnection,
        hasSetupFailed,
      })
    : 'CHECKING';
  const isConnectionExpected = state.step === 'loading' && isApiKeyExpected;
  const showsConnectionCard =
    isConnectionExpected ||
    (isDefined(status) && (status.isApiKeySet || isSettingUpConnection));
  const showsLiveSyncSections =
    isConnectionExpected || connectionState === 'CONNECTED';
  const showsDangerZone =
    isConnectionExpected ||
    (isDefined(status) && status.isApiKeySet && !isSettingUpConnection);

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
        <GranolaConnectionSection>
          {state.step === 'unavailable' && (
            <Info
              accent="danger"
              text={t('Could not load Granola settings.')}
              buttonTitle={t('Retry')}
              onClick={loadConnectionStatus}
            />
          )}
          {state.step !== 'unavailable' && !showsConnectionCard && (
            <GranolaApiKeyForm
              errorMessage={connectError}
              isConnectDisabled={!isDefined(status)}
              onConnect={handleConnect}
            />
          )}
          {showsConnectionCard && (
            <GranolaConnectionCard
              connectionState={connectionState}
              isWorkspaceKey={
                status?.registration?.scopes.includes('workspace') ?? false
              }
              onRetry={
                status?.isConnected ? registerLiveSync : loadConnectionStatus
              }
              onReplaceKey={handleRemoveApiKey}
            />
          )}
        </GranolaConnectionSection>
        {showsLiveSyncSections && (
          <>
            <GranolaFolderSection />
            <GranolaImportHistorySection />
          </>
        )}
        {showsDangerZone && (
          <GranolaDangerZoneSection
            isDisabled={isRemoving || !isDefined(status)}
            onDisconnect={handleRemoveApiKey}
          />
        )}
      </StyledContainer>
    </ThemeContext.Provider>
  );
};
