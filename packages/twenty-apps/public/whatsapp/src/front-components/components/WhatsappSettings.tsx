import { useRef, useState } from 'react';
import { enqueueSnackbar, t, useLocation } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WhatsappHistorySection } from 'src/front-components/components/WhatsappHistorySection';
import { WhatsappSettingsContainer } from 'src/front-components/components/WhatsappSettingsContainer';
import { WhatsappSyncTab } from 'src/front-components/components/WhatsappSyncTab';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { useWhatsappSettingsView } from 'src/front-components/hooks/use-whatsapp-settings-view';
import { getNextWhatsappSyncProgress } from 'src/front-components/utils/get-next-whatsapp-sync-progress.util';
import { isWhatsappHistoryTabHash } from 'src/front-components/utils/is-whatsapp-history-tab-hash.util';
import { notifyWhatsappHistoryImportEnd } from 'src/front-components/utils/notify-whatsapp-history-import-end.util';
import { postWhatsappSettingsRouteOrThrow } from 'src/front-components/utils/post-whatsapp-settings-route-or-throw.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const HISTORY_IMPORT_POLL_MILLISECONDS = 2000;

export const WhatsappSettings = () => {
  const isHistoryTab = isWhatsappHistoryTabHash(useLocation()?.hash);
  const [isImportStarting, setIsImportStarting] = useState(false);
  const [isImportCancelling, setIsImportCancelling] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    runId: string;
    progress: number;
  } | null>(null);
  const lastHistoryImportRef = useRef<WhatsappHistoryImportState | null>(null);

  const {
    state,
    loadCount,
    showView,
    loadSettings,
    updateSettings,
    waitForPendingSaves,
  } = useWhatsappSettingsView({
    onViewShown: (shownView) => {
      const historyImport = shownView.isConnected
        ? shownView.historyImport
        : null;

      notifyWhatsappHistoryImportEnd({
        previous: lastHistoryImportRef.current,
        next: historyImport,
      });
      lastHistoryImportRef.current = historyImport;
      setImportProgress((current) =>
        getNextWhatsappSyncProgress({ current, historyImport }),
      );
    },
  });

  const handleImport = async () => {
    setIsImportStarting(true);

    try {
      await waitForPendingSaves();

      showView(
        await postWhatsappSettingsRouteOrThrow({
          routePath: WHATSAPP_SETTINGS_ROUTE_PATHS.syncHistory,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not start the WhatsApp import. Try again.'),
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
        await postWhatsappSettingsRouteOrThrow({
          routePath: WHATSAPP_SETTINGS_ROUTE_PATHS.cancelHistoryImport,
        }),
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not cancel the WhatsApp import. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsImportCancelling(false);
    }
  };

  const view =
    state.step === 'ready' && state.view.isConnected ? state.view : undefined;

  return (
    <WhatsappSettingsContainer state={state} onLoad={loadSettings}>
      {view?.historyImport?.status === 'IMPORTING' && (
        <TimeoutEffect
          key={loadCount}
          delayMilliseconds={HISTORY_IMPORT_POLL_MILLISECONDS}
          onTimeout={loadSettings}
        />
      )}
      {isDefined(view) && !isHistoryTab && (
        <WhatsappSyncTab
          connection={view.connection}
          settings={view.settings}
          onSettingsChange={updateSettings}
        />
      )}
      {isDefined(view) && isHistoryTab && (
        <WhatsappHistorySection
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
    </WhatsappSettingsContainer>
  );
};
