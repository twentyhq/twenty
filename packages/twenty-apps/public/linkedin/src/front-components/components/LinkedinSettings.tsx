import { useRef, useState } from 'react';
import { enqueueSnackbar, t, useLocation } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LinkedinHistorySection } from 'src/front-components/components/LinkedinHistorySection';
import { LinkedinSettingsContainer } from 'src/front-components/components/LinkedinSettingsContainer';
import { LinkedinSyncTab } from 'src/front-components/components/LinkedinSyncTab';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { useLinkedinSettingsView } from 'src/front-components/hooks/use-linkedin-settings-view';
import { getNextLinkedinSyncProgress } from 'src/front-components/utils/get-next-linkedin-sync-progress.util';
import { isLinkedinHistoryTabHash } from 'src/front-components/utils/is-linkedin-history-tab-hash.util';
import { notifyLinkedinHistoryImportEnd } from 'src/front-components/utils/notify-linkedin-history-import-end.util';
import { postLinkedinSettingsRouteOrThrow } from 'src/front-components/utils/post-linkedin-settings-route-or-throw.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const HISTORY_IMPORT_POLL_MILLISECONDS = 2000;

export const LinkedinSettings = () => {
  const isHistoryTab = isLinkedinHistoryTabHash(useLocation()?.hash);
  const [isImportStarting, setIsImportStarting] = useState(false);
  const [isImportCancelling, setIsImportCancelling] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    runId: string;
    progress: number;
  } | null>(null);
  const lastHistoryImportRef = useRef<LinkedinHistoryImportState | null>(null);

  const {
    state,
    loadCount,
    showView,
    loadSettings,
    updateSettings,
    waitForPendingSaves,
  } = useLinkedinSettingsView({
    onViewShown: (shownView) => {
      const historyImport = shownView.isConnected
        ? shownView.historyImport
        : null;

      notifyLinkedinHistoryImportEnd({
        previous: lastHistoryImportRef.current,
        next: historyImport,
      });
      lastHistoryImportRef.current = historyImport;
      setImportProgress((current) =>
        getNextLinkedinSyncProgress({ current, historyImport }),
      );
    },
  });

  const handleImport = async () => {
    setIsImportStarting(true);

    try {
      await waitForPendingSaves();

      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.syncHistory,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not start the LinkedIn import. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsImportStarting(false);
    }
  };

  const handleCancelImport = async () => {
    setIsImportCancelling(true);

    try {
      showView(
        await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.cancelHistoryImport,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not cancel the LinkedIn import. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsImportCancelling(false);
    }
  };

  const view =
    state.step === 'ready' && state.view.isConnected ? state.view : undefined;

  return (
    <LinkedinSettingsContainer state={state} onLoad={loadSettings}>
      {view?.historyImport?.status === 'IMPORTING' && (
        <TimeoutEffect
          key={loadCount}
          delayMilliseconds={HISTORY_IMPORT_POLL_MILLISECONDS}
          onTimeout={loadSettings}
        />
      )}
      {isDefined(view) && !isHistoryTab && (
        <LinkedinSyncTab
          connection={view.connection}
          settings={view.settings}
          onSettingsChange={updateSettings}
        />
      )}
      {isDefined(view) && isHistoryTab && (
        <LinkedinHistorySection
          importPolicy={view.settings.importPolicy}
          selectedChats={view.settings.selectedChats}
          historyConversationLimit={view.settings.historyConversationLimit}
          historyImport={view.historyImport}
          importProgress={
            importProgress?.runId === view.historyImport?.runId
              ? importProgress?.progress
              : undefined
          }
          isImportStarting={isImportStarting}
          isImportCancelling={isImportCancelling}
          onHistoryConversationLimitChange={(historyConversationLimit) =>
            updateSettings({ historyConversationLimit })
          }
          onImport={handleImport}
          onCancelImport={handleCancelImport}
        />
      )}
    </LinkedinSettingsContainer>
  );
};
