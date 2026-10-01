import { expect } from 'storybook/test';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';

export const withKnownListItemHostErrors = async (
  runTest: () => Promise<void>,
) => {
  const hostErrors: ErrorEvent[] = [];
  const captureHostError = (event: ErrorEvent) => {
    hostErrors.push(event);

    if (event.message === SANDBOX_ERROR_PATTERNS.HOST_EVENT_LISTENER) {
      event.preventDefault();
    }
  };

  window.addEventListener('error', captureHostError);

  try {
    await runTest();
  } finally {
    window.removeEventListener('error', captureHostError);

    for (const hostError of hostErrors) {
      expect(hostError.message).toBe(
        SANDBOX_ERROR_PATTERNS.HOST_EVENT_LISTENER,
      );
      expect(hostError.error).toMatchObject({
        stack: expect.stringContaining('eventListenerCallbackWrapper'),
      });
    }
  }
};
