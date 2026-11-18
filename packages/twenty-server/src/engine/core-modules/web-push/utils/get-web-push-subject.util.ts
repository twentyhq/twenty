import { isNonEmptyString } from '@sniptt/guards';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const getWebPushSubject = ({
  twentyConfigService,
}: {
  twentyConfigService: Pick<TwentyConfigService, 'get'>;
}): string => {
  const subject = twentyConfigService.get('WEB_PUSH_SUBJECT');

  if (isNonEmptyString(subject)) {
    return subject;
  }

  const serverUrl = twentyConfigService.get('SERVER_URL');

  if (serverUrl.startsWith('https:')) {
    return serverUrl;
  }

  return `mailto:${twentyConfigService.get('EMAIL_FROM_ADDRESS')}`;
};
