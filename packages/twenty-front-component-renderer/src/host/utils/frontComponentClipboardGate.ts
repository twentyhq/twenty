import { isDefined } from 'twenty-shared/utils';

const CLIPBOARD_GESTURE_WINDOW_MS = 3000;

type PendingClipboardWrite = {
  resolveText: (text: string) => void;
  abortWrite: () => void;
  writePromise: Promise<void>;
};

let pendingClipboardWrite: PendingClipboardWrite | null = null;
let pendingClipboardWriteTimeoutId: ReturnType<typeof setTimeout> | null = null;

const isAsyncClipboardWriteSupported = (): boolean =>
  typeof navigator !== 'undefined' &&
  isDefined(navigator.clipboard) &&
  typeof navigator.clipboard.write === 'function' &&
  typeof ClipboardItem !== 'undefined';

const clearPendingClipboardWrite = (): void => {
  if (isDefined(pendingClipboardWriteTimeoutId)) {
    clearTimeout(pendingClipboardWriteTimeoutId);
    pendingClipboardWriteTimeoutId = null;
  }
  pendingClipboardWrite = null;
};

export const armClipboardWriteFromUserGesture = (): void => {
  if (!isAsyncClipboardWriteSupported()) {
    return;
  }

  pendingClipboardWrite?.abortWrite();
  clearPendingClipboardWrite();

  let resolveText: (text: string) => void = () => {};
  let abortWrite: () => void = () => {};

  const textPromise = new Promise<string>((resolve, reject) => {
    resolveText = resolve;
    abortWrite = () => reject(new Error('Clipboard write aborted'));
  });

  const writePromise = navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': textPromise.then(
        (text) => new Blob([text], { type: 'text/plain' }),
      ),
    }),
  ]);

  writePromise.catch(() => {});

  pendingClipboardWrite = { resolveText, abortWrite, writePromise };

  pendingClipboardWriteTimeoutId = setTimeout(() => {
    pendingClipboardWrite?.abortWrite();
    clearPendingClipboardWrite();
  }, CLIPBOARD_GESTURE_WINDOW_MS);
};

export const fulfillClipboardWriteFromUserGesture = (
  text: string,
): Promise<void> | null => {
  if (!isDefined(pendingClipboardWrite)) {
    return null;
  }

  const { resolveText, writePromise } = pendingClipboardWrite;
  clearPendingClipboardWrite();
  resolveText(text);

  return writePromise;
};
