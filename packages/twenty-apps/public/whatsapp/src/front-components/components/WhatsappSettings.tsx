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

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WhatsappAccountBanners } from 'src/front-components/components/WhatsappAccountBanners';
import { WhatsappAccountField } from 'src/front-components/components/WhatsappAccountField';
import { WhatsappContactAutoCreationSection } from 'src/front-components/components/WhatsappContactAutoCreationSection';
import { WhatsappImportSection } from 'src/front-components/components/WhatsappImportSection';
import { WhatsappSettingsSkeleton } from 'src/front-components/components/WhatsappSettingsSkeleton';
import { WhatsappReadStatusSection } from 'src/front-components/components/WhatsappReadStatusSection';
import { WhatsappVisibilitySection } from 'src/front-components/components/WhatsappVisibilitySection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { createSettingsSaveQueue } from 'src/front-components/utils/create-settings-save-queue.util';
import { getNextWhatsappSyncProgress } from 'src/front-components/utils/get-next-whatsapp-sync-progress.util';
import { notifyWhatsappHistoryImportEnd } from 'src/front-components/utils/notify-whatsapp-history-import-end.util';
import { postWhatsappSettingsRouteOrThrow } from 'src/front-components/utils/post-whatsapp-settings-route-or-throw.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

type WhatsappSettingsValues = Extract<
  WhatsappSettingsView,
  { isConnected: true }
>['settings'];

const HISTORY_IMPORT_POLL_MILLISECONDS = 2000;

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

type WhatsappSettingsState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; view: WhatsappSettingsView };

export const WhatsappSettings = () => {
  const colorScheme = useColorScheme();
  const [state, setState] = useState<WhatsappSettingsState>({
    step: 'loading',
  });
  const [pollCount, setPollCount] = useState(0);

  const [isImportRetrying, setIsImportRetrying] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    runId: string;
    progress: number;
  } | null>(null);
  const lastHistoryImportRef = useRef<WhatsappHistoryImportState | null>(null);
  const [settingsSaveQueue] = useState(() =>
    createSettingsSaveQueue<WhatsappSettingsView>(),
  );

  const showView = (view: WhatsappSettingsView) => {
    const historyImport = view.isConnected ? view.historyImport : null;

    notifyWhatsappHistoryImportEnd({
      previous: lastHistoryImportRef.current,
      next: historyImport,
    });
    lastHistoryImportRef.current = historyImport;
    setImportProgress((current) =>
      getNextWhatsappSyncProgress({ current, historyImport }),
    );
    setState({ step: 'ready', view });
  };

  const loadSettings = async () => {
    try {
      const view = await postWhatsappSettingsRouteOrThrow({
        routePath: WHATSAPP_SETTINGS_ROUTE_PATHS.get,
      });

      if (!settingsSaveQueue.hasPendingSave()) {
        showView(view);
      }
    } catch {
      setState((current) =>
        current.step === 'ready' ? current : { step: 'unavailable' },
      );
    } finally {
      setPollCount((previousPollCount) => previousPollCount + 1);
    }
  };

  const handleSettingsChange = async (
    update: Partial<WhatsappSettingsValues>,
  ) => {
    setState((current) => {
      if (current.step !== 'ready' || !current.view.isConnected) {
        return current;
      }

      return {
        step: 'ready',
        view: {
          ...current.view,
          settings: { ...current.view.settings, ...update },
        },
      };
    });

    await settingsSaveQueue.enqueue({
      save: () =>
        postWhatsappSettingsRouteOrThrow({
          routePath: WHATSAPP_SETTINGS_ROUTE_PATHS.update,
          body: update,
        }),
      onSaved: showView,
      onFailed: async (hasPendingSave) => {
        enqueueSnackbar({
          message: t('Could not save WhatsApp settings. Try again.'),
          variant: 'error',
        });

        if (!hasPendingSave) {
          await loadSettings();
        }
      },
    });
  };

  const handleRetryImport = async () => {
    setIsImportRetrying(true);

    try {
      await settingsSaveQueue.whenIdle();

      showView(
        await postWhatsappSettingsRouteOrThrow({
          routePath: WHATSAPP_SETTINGS_ROUTE_PATHS.syncHistory,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not retry the WhatsApp import. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsImportRetrying(false);
    }
  };

  const view = state.step === 'ready' ? state.view : undefined;
  const isImportingHistory =
    view?.isConnected && view.historyImport?.status === 'IMPORTING';

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
        {state.step === 'loading' && <WhatsappSettingsSkeleton />}
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
            {t('Could not load WhatsApp settings.')}
          </InlineBanner>
        )}
        {view?.isConnected === false && (
          <Section.Root>
            <Section.Header
              title={t('Account')}
              description={t(
                'Connect your WhatsApp account to choose what gets synced.',
              )}
            />
          </Section.Root>
        )}
        {view?.isConnected && (
          <>
            <WhatsappAccountBanners
              isAuthFailed={view.connection.isAuthFailed}
              historyImport={view.historyImport}
              isImportRetrying={isImportRetrying}
              onRetryImport={handleRetryImport}
            />
            <WhatsappAccountField
              name={view.connection.name}
              handle={view.connection.handle}
              historyImport={view.historyImport}
              importProgress={
                importProgress?.runId === view.historyImport?.runId
                  ? importProgress?.progress
                  : undefined
              }
            />
            <WhatsappImportSection
              importPolicy={view.settings.importPolicy}
              selectedChats={view.settings.selectedChats}
              onChange={(importPolicy) =>
                handleSettingsChange({ importPolicy })
              }
              onSelectedChatsChange={(selectedChats) =>
                handleSettingsChange({ selectedChats })
              }
            />
            <WhatsappVisibilitySection
              visibility={view.settings.visibility}
              onChange={(visibility) => handleSettingsChange({ visibility })}
            />
            <WhatsappContactAutoCreationSection
              policy={view.settings.contactAutoCreationPolicy}
              onChange={(contactAutoCreationPolicy) =>
                handleSettingsChange({ contactAutoCreationPolicy })
              }
            />
            <WhatsappReadStatusSection
              areChatsMarkedAsRead={view.settings.areChatsMarkedAsRead}
              onChange={(areChatsMarkedAsRead) =>
                handleSettingsChange({ areChatsMarkedAsRead })
              }
            />
          </>
        )}
      </StyledContainer>
    </ThemeProvider>
  );
};
