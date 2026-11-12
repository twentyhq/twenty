import { isDefined } from 'twenty-shared/utils';

import { runProxyHeaderCommand } from '@/proxy-headers/run-proxy-header-command';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';
import { type ProxyHeaders } from '@/proxy-headers/types/proxy-headers.type';

export const createProxyHeaders = ({
  headers,
  headerCommand,
}: ProxyHeaderSettings): ProxyHeaders | undefined => {
  if (!isDefined(headerCommand)) {
    return Object.keys(headers).length === 0
      ? undefined
      : { read: async () => headers, isRenewable: false, renew: () => {} };
  }

  let commandHeaders: Promise<Record<string, string>> | undefined;

  return {
    read: async (signal) => {
      commandHeaders ??= runProxyHeaderCommand({
        command: headerCommand,
        signal,
      });

      try {
        return { ...headers, ...(await commandHeaders) };
      } catch (error) {
        commandHeaders = undefined;
        throw error;
      }
    },
    isRenewable: true,
    renew: () => {
      commandHeaders = undefined;
    },
  };
};
