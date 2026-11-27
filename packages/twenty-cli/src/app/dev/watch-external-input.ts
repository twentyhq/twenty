import { type FSWatcher, watch } from 'node:fs';
import { clearInterval, setInterval } from 'node:timers';

import { isDefined } from 'twenty-shared/utils';

import { isBroadWatchDirectory } from '@/app/dev/is-broad-watch-directory';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { type WatchInput } from '@/app/dev/types/watch-inputs.type';
import { toCliError } from '@/output/to-cli-error';
import { hasErrorCode } from '@/utils/has-error-code';

const RECOVERY_INTERVAL_MS = 1000;
const NATIVE_WATCH_SETTLE_MS = 100;

export const watchExternalInput = ({
  input,
  onChange,
  onError,
}: {
  input: Pick<WatchInput, 'path' | 'kind'>;
  onChange: () => void;
  onError: (error: Error) => void;
}) => {
  let nativeWatcher: FSWatcher | undefined;
  let pendingCheck: NodeJS.Timeout | undefined;
  let recoveryTimer: NodeJS.Timeout | undefined;
  let isClosed = false;
  let stamp = readWatchInputStamp(input);

  const stopRecovery = () => {
    clearInterval(recoveryTimer);
    recoveryTimer = undefined;
  };

  const close = () => {
    isClosed = true;
    clearTimeout(pendingCheck);
    nativeWatcher?.close();
    nativeWatcher = undefined;
    stopRecovery();
  };

  const refresh = () => {
    if (isClosed) {
      return;
    }

    nativeWatcher?.close();
    nativeWatcher = undefined;
    clearTimeout(pendingCheck);

    try {
      if (input.kind === 'directory' && isBroadWatchDirectory(input.path)) {
        close();
        onChange();
        return;
      }

      const attachmentStamp = readWatchInputStamp(input);
      const watcher = watch(input.path, { persistent: false }, () => {
        if (isClosed || nativeWatcher !== watcher) {
          return;
        }

        // Native watchers follow inodes, so replacements need a new watcher.
        refresh();
      });
      nativeWatcher = watcher;
      watcher.on('error', (error) => {
        if (isClosed || nativeWatcher !== watcher) {
          return;
        }

        if (hasErrorCode(error, 'EPERM') || hasErrorCode(error, 'ENOENT')) {
          refresh();
        } else {
          close();
          onError(error);
        }
      });
      stopRecovery();
      // A save can happen before native event registration settles.
      pendingCheck = setTimeout(() => {
        if (
          !isClosed &&
          nativeWatcher === watcher &&
          readWatchInputStamp(input) !== attachmentStamp
        ) {
          refresh();
        }
      }, NATIVE_WATCH_SETTLE_MS);
      pendingCheck.unref();
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT') || hasErrorCode(error, 'ENOTDIR')) {
        if (!isDefined(recoveryTimer)) {
          recoveryTimer = setInterval(refresh, RECOVERY_INTERVAL_MS);
          recoveryTimer.unref();
        }
      } else {
        close();
        onError(toCliError(error));
        return;
      }
    }

    const nextStamp = readWatchInputStamp(input);
    if (nextStamp !== stamp) {
      stamp = nextStamp;
      onChange();
    }
  };

  refresh();

  return close;
};
