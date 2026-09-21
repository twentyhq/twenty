import { useEffect } from 'react';
import { SETTINGS_BANNER_ACTION_BROWSER_EVENT_NAME } from 'twenty-shared/constants';
import { type SettingsBannerActionBrowserEventDetail } from 'twenty-shared/types';

import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentSettingsBannerActionEffectProps = {
  thread: FrontComponentThread;
  frontComponentId: string;
  onError: (error: Error) => void;
};

export const FrontComponentSettingsBannerActionEffect = ({
  thread,
  frontComponentId,
  onError,
}: FrontComponentSettingsBannerActionEffectProps) => {
  useEffect(() => {
    const handleSettingsBannerAction = (
      event: CustomEvent<SettingsBannerActionBrowserEventDetail>,
    ) => {
      if (event.detail.frontComponentId !== frontComponentId) {
        return;
      }

      thread.imports.onSettingsBannerActionClick().catch(onError);
    };

    window.addEventListener(
      SETTINGS_BANNER_ACTION_BROWSER_EVENT_NAME,
      handleSettingsBannerAction as EventListener,
    );

    return () => {
      window.removeEventListener(
        SETTINGS_BANNER_ACTION_BROWSER_EVENT_NAME,
        handleSettingsBannerAction as EventListener,
      );
    };
  }, [thread, frontComponentId, onError]);

  return null;
};
