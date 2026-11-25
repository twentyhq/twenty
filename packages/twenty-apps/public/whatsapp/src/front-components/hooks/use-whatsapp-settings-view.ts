import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { createSettingsSaveQueue } from 'src/front-components/utils/create-settings-save-queue.util';
import { postWhatsappSettingsRouteOrThrow } from 'src/front-components/utils/post-whatsapp-settings-route-or-throw.util';
import { type WhatsappConnectedSettingsView } from 'src/types/whatsapp-connected-settings-view.type';
import { type WhatsappSettingsLoadState } from 'src/types/whatsapp-settings-load-state.type';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

type UseWhatsappSettingsViewParams = {
  onViewShown?: (view: WhatsappSettingsView) => void;
};

export const useWhatsappSettingsView = ({
  onViewShown,
}: UseWhatsappSettingsViewParams = {}) => {
  const [state, setState] = useState<WhatsappSettingsLoadState>({
    step: 'loading',
  });
  const [loadCount, setLoadCount] = useState(0);
  const [settingsSaveQueue] = useState(() =>
    createSettingsSaveQueue<WhatsappSettingsView>(),
  );

  const showView = (view: WhatsappSettingsView) => {
    onViewShown?.(view);
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
      setLoadCount((previousLoadCount) => previousLoadCount + 1);
    }
  };

  const updateSettings = async (
    update: Partial<WhatsappConnectedSettingsView['settings']>,
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

  return {
    state,
    loadCount,
    showView,
    loadSettings,
    updateSettings,
    waitForPendingSaves: settingsSaveQueue.whenIdle,
  };
};
