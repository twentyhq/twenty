import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { enqueueSnackbar, t, useColorScheme } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  themeCssVariables,
} from 'twenty-ui/theme';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LinkedinAccountField } from 'src/front-components/components/LinkedinAccountField';
import { LinkedinContactAutoCreationSection } from 'src/front-components/components/LinkedinContactAutoCreationSection';
import { LinkedinImportSection } from 'src/front-components/components/LinkedinImportSection';
import { LinkedinPeopleMatchingSection } from 'src/front-components/components/LinkedinPeopleMatchingSection';
import { LinkedinSettingsSkeleton } from 'src/front-components/components/LinkedinSettingsSkeleton';
import { LinkedinReadStatusSection } from 'src/front-components/components/LinkedinReadStatusSection';
import { LinkedinVisibilitySection } from 'src/front-components/components/LinkedinVisibilitySection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { notifyLinkedinHistoryImportEnd } from 'src/front-components/utils/notify-linkedin-history-import-end.util';
import { postLinkedinSettingsRouteOrThrow } from 'src/front-components/utils/post-linkedin-settings-route-or-throw.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

type LinkedinSettingsValues = Extract<
  LinkedinSettingsView,
  { isConnected: true }
>['settings'];

const HISTORY_IMPORT_POLL_MILLISECONDS = 5000;

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

type LinkedinSettingsState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; view: LinkedinSettingsView };

export const LinkedinSettings = () => {
  const colorScheme = useColorScheme();
  const [state, setState] = useState<LinkedinSettingsState>({
    step: 'loading',
  });
  const [pollCount, setPollCount] = useState(0);

  const [isSyncStarting, setIsSyncStarting] = useState(false);
  const lastHistoryImportRef = useRef<LinkedinHistoryImportState | null>(null);

  const showView = (view: LinkedinSettingsView) => {
    const historyImport = view.isConnected ? view.historyImport : null;

    notifyLinkedinHistoryImportEnd({
      previous: lastHistoryImportRef.current,
      next: historyImport,
    });
    lastHistoryImportRef.current = historyImport;
    setState({ step: 'ready', view });
  };

  const loadSettings = async () => {
    try {
      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.get,
        }),
      );
    } catch {
      setState((current) =>
        current.step === 'ready' ? current : { step: 'unavailable' },
      );
    } finally {
      setPollCount((previousPollCount) => previousPollCount + 1);
    }
  };

  const handleSettingsChange = async (
    update: Partial<LinkedinSettingsValues>,
  ) => {
    setState((current) =>
      current.step === 'ready' && current.view.isConnected
        ? {
            step: 'ready',
            view: {
              ...current.view,
              settings: { ...current.view.settings, ...update },
            },
          }
        : current,
    );

    try {
      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.update,
          body: update,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not save LinkedIn settings. Try again.'),
        variant: 'error',
      });
      await loadSettings();
    }
  };

  const handleSync = async () => {
    setIsSyncStarting(true);

    try {
      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.syncHistory,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not start the LinkedIn sync. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsSyncStarting(false);
    }
  };

  const handleCancelSync = async () => {
    try {
      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.cancelHistoryImport,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not cancel the LinkedIn sync. Try again.'),
        variant: 'error',
      });
    }
  };

  const view = state.step === 'ready' ? state.view : undefined;
  const isImportingHistory =
    view?.isConnected === true && view.historyImport?.status === 'IMPORTING';

  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      <StyledContainer>
        <OnMountEffect onMount={loadSettings} />
        {isImportingHistory && (
          <TimeoutEffect
            key={pollCount}
            delayMilliseconds={HISTORY_IMPORT_POLL_MILLISECONDS}
            onTimeout={loadSettings}
          />
        )}
        {state.step === 'loading' && <LinkedinSettingsSkeleton />}
        {state.step === 'unavailable' && (
          <InlineBanner
            layout="compact"
            status="error"
            action={
              <InlineBanner.Action onClick={loadSettings}>
                {t('Retry')}
              </InlineBanner.Action>
            }
          >
            {t('Could not load LinkedIn settings.')}
          </InlineBanner>
        )}
        {view?.isConnected === false && (
          <Section.Root>
            <Section.Header
              title={t('Account')}
              description={t(
                'Connect your LinkedIn account to choose what gets synced.',
              )}
            />
          </Section.Root>
        )}
        {view?.isConnected === true && (
          <>
            <LinkedinAccountField
              name={view.connection.name}
              handle={view.connection.handle}
              isAuthFailed={view.connection.isAuthFailed}
            />
            <LinkedinImportSection
              importPolicy={view.settings.importPolicy}
              areGroupChatsImported={view.settings.areGroupChatsImported}
              historyImport={view.historyImport}
              isSyncStarting={isSyncStarting}
              onChange={(importPolicy) =>
                handleSettingsChange({ importPolicy })
              }
              onGroupChatsImportChange={(areGroupChatsImported) =>
                handleSettingsChange({ areGroupChatsImported })
              }
              onSync={handleSync}
              onCancelSync={handleCancelSync}
            />
            <LinkedinVisibilitySection
              visibility={view.settings.visibility}
              onChange={(visibility) => handleSettingsChange({ visibility })}
            />
            <LinkedinContactAutoCreationSection
              policy={view.settings.contactAutoCreationPolicy}
              onChange={(contactAutoCreationPolicy) =>
                handleSettingsChange({ contactAutoCreationPolicy })
              }
            />
            <LinkedinPeopleMatchingSection
              isNameMatchingEnabled={view.settings.isNameMatchingEnabled}
              onChange={(isNameMatchingEnabled) =>
                handleSettingsChange({ isNameMatchingEnabled })
              }
            />
            <LinkedinReadStatusSection />
          </>
        )}
      </StyledContainer>
    </ThemeProvider>
  );
};
