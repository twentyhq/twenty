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

  let pendingHeaders: Promise<Record<string, string>> | undefined;
  let currentHeaders: Record<string, string> | undefined;

  return {
    read: (signal) => {
      if (!isDefined(pendingHeaders)) {
        const attempt = runProxyHeaderCommand({
          command: headerCommand,
          signal,
        }).then((commandHeaders) => ({ ...headers, ...commandHeaders }));

        pendingHeaders = attempt;
        currentHeaders = undefined;
        attempt.then(
          (resolvedHeaders) => {
            if (pendingHeaders === attempt) {
              currentHeaders = resolvedHeaders;
            }
          },
          () => {
            if (pendingHeaders === attempt) {
              pendingHeaders = undefined;
            }
          },
        );
      }

      return pendingHeaders;
    },
    isRenewable: true,
    // Concurrent rejections of the same headers share one renewal.
    renew: (rejectedHeaders) => {
      if (currentHeaders === rejectedHeaders) {
        pendingHeaders = undefined;
        currentHeaders = undefined;
      }
    },
  };
};
