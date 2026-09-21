import { isDefined } from 'twenty-shared/utils';

import { pendingSettingsBannerActionCallback } from '@/remote/worker/thread/states/pendingSettingsBannerActionCallback';

export const handleSettingsBannerActionClick = async () => {
  const onClick = pendingSettingsBannerActionCallback.current;

  if (!isDefined(onClick)) {
    return;
  }

  onClick();
};
