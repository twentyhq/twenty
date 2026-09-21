import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type ShowSettingsBannerFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const showSettingsBanner: ShowSettingsBannerFunction = (params) => {
  const showSettingsBannerFunction =
    frontComponentHostCommunicationApi.showSettingsBanner;

  if (!isDefined(showSettingsBannerFunction)) {
    throw new Error('showSettingsBannerFunction is not set');
  }

  return showSettingsBannerFunction(params);
};
