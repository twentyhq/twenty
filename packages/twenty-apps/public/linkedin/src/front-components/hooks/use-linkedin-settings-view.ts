import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { createSettingsSaveQueue } from 'src/front-components/utils/create-settings-save-queue.util';
import { postLinkedinSettingsRouteOrThrow } from 'src/front-components/utils/post-linkedin-settings-route-or-throw.util';
import { type LinkedinConnectedSettingsView } from 'src/types/linkedin-connected-settings-view.type';
import { type LinkedinSettingsLoadState } from 'src/types/linkedin-settings-load-state.type';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

type UseLinkedinSettingsViewParams = {
  onViewShown?: (view: LinkedinSettingsView) => void;
};

export const useLinkedinSettingsView = ({
  onViewShown,
}: UseLinkedinSettingsViewParams = {}) => {
  const [state, setState] = useState<LinkedinSettingsLoadState>({
    step: 'loading',
  });
  const [loadCount, setLoadCount] = useState(0);
  const [settingsSaveQueue] = useState(() =>
    createSettingsSaveQueue<LinkedinSettingsView>(),
  );

  const showView = (view: LinkedinSettingsView) => {
    onViewShown?.(view);
    setState({ step: 'ready', view });
  };

  const loadSettings = async () => {
    try {
      const view = await postLinkedinSettingsRouteOrThrow({
        routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.get,
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
    update: Partial<LinkedinConnectedSettingsView['settings']>,
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
        postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.update,
          body: update,
        }),
      onSaved: showView,
      onFailed: async (hasPendingSave) => {
        enqueueSnackbar({
          message: t('Could not save LinkedIn settings. Try again.'),
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
