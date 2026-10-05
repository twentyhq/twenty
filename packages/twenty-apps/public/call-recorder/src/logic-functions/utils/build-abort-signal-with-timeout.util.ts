import { isUndefined } from '@sniptt/guards';

export const buildAbortSignalWithTimeout = ({
  timeoutMs,
  signal,
}: {
  timeoutMs: number;
  signal: AbortSignal | undefined;
}): AbortSignal =>
  AbortSignal.any([
    AbortSignal.timeout(timeoutMs),
    ...(isUndefined(signal) ? [] : [signal]),
  ]);
