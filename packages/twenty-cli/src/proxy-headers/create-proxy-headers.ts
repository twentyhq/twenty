import { isDefined } from 'twenty-shared/utils';

import { runProxyHeaderCommand } from '@/proxy-headers/run-proxy-header-command';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';
import { type ProxyHeaders } from '@/proxy-headers/types/proxy-headers.type';

type CommandRun = {
  headers: Promise<Record<string, string>>;
  controller: AbortController;
  waitingSignals: Set<AbortSignal>;
};

// Each caller stops waiting on its own abort; the command stops once none wait.
const waitForCommandRun = ({
  commandRun,
  signal,
}: {
  commandRun: CommandRun;
  signal: AbortSignal;
}) =>
  new Promise<Record<string, string>>((resolve, reject) => {
    const stopWaiting = () => {
      commandRun.waitingSignals.delete(signal);
      signal.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      stopWaiting();

      if (commandRun.waitingSignals.size === 0) {
        commandRun.controller.abort();
      }

      reject(signal.reason);
    };

    commandRun.waitingSignals.add(signal);
    signal.addEventListener('abort', onAbort, { once: true });
    commandRun.headers.then(resolve, reject).finally(stopWaiting);
  });

export const createProxyHeaders = ({
  headers,
  headerCommand,
}: ProxyHeaderSettings): ProxyHeaders | undefined => {
  if (!isDefined(headerCommand)) {
    return Object.keys(headers).length === 0
      ? undefined
      : { read: async () => headers, isRenewable: false, renew: () => {} };
  }

  let pendingRun: CommandRun | undefined;
  let currentHeaders: Record<string, string> | undefined;

  const startCommandRun = (): CommandRun => {
    const controller = new AbortController();
    const commandRun: CommandRun = {
      controller,
      waitingSignals: new Set(),
      headers: runProxyHeaderCommand({
        command: headerCommand,
        signal: controller.signal,
      }).then((commandHeaders) => ({ ...headers, ...commandHeaders })),
    };

    commandRun.headers.then(
      (resolvedHeaders) => {
        if (pendingRun === commandRun) {
          currentHeaders = resolvedHeaders;
        }
      },
      () => {
        if (pendingRun === commandRun) {
          pendingRun = undefined;
        }
      },
    );

    return commandRun;
  };

  return {
    read: async (signal) => {
      signal.throwIfAborted();

      if (!isDefined(pendingRun) || pendingRun.controller.signal.aborted) {
        pendingRun = startCommandRun();
        currentHeaders = undefined;
      }

      return waitForCommandRun({ commandRun: pendingRun, signal });
    },
    isRenewable: true,
    // Concurrent rejections of the same headers share one renewal.
    renew: (rejectedHeaders) => {
      if (currentHeaders === rejectedHeaders) {
        pendingRun = undefined;
        currentHeaders = undefined;
      }
    },
  };
};
