import { type HideSettingsBannerFunction } from 'twenty-sdk/front-component';

import { pendingSettingsBannerActionCallback } from '@/remote/worker/thread/states/pendingSettingsBannerActionCallback';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const createHideSettingsBannerAdapter = (
  hostApi: Pick<FrontComponentHostCommunicationApi, 'hideSettingsBanner'>,
): HideSettingsBannerFunction => {
  return async () => {
    pendingSettingsBannerActionCallback.current = null;

    await hostApi.hideSettingsBanner();
  };
};
