import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type HideSettingsBannerFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const hideSettingsBanner: HideSettingsBannerFunction = () => {
  const hideSettingsBannerFunction =
    frontComponentHostCommunicationApi.hideSettingsBanner;

  if (!isDefined(hideSettingsBannerFunction)) {
    throw new Error('hideSettingsBannerFunction is not set');
  }

  return hideSettingsBannerFunction();
};
