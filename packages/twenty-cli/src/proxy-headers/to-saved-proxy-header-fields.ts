import { isDefined } from 'twenty-shared/utils';

import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';

export const toSavedProxyHeaderFields = ({
  headers,
  headerCommand,
}: ProxyHeaderSettings) => ({
  ...(Object.keys(headers).length > 0 ? { proxyHeaders: headers } : {}),
  ...(isDefined(headerCommand) ? { proxyHeaderCommand: headerCommand } : {}),
});
