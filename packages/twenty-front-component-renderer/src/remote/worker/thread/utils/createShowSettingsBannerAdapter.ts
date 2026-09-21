import { type ShowSettingsBannerFunction } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

import { pendingSettingsBannerActionCallback } from '@/remote/worker/thread/states/pendingSettingsBannerActionCallback';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const createShowSettingsBannerAdapter = (
  hostApi: Pick<FrontComponentHostCommunicationApi, 'showSettingsBanner'>,
): ShowSettingsBannerFunction => {
  return async ({ variant, text, action }) => {
    pendingSettingsBannerActionCallback.current = action?.onClick ?? null;

    await hostApi.showSettingsBanner({
      variant,
      text,
      action: isDefined(action) ? { label: action.label } : undefined,
    });
  };
};
