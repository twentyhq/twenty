import { expect, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

// Worker errors may be coalesced by the host's error state; require the
// triggering failure and reject errors outside the documented sandbox gaps.
export const expectSandboxErrors = async (
  expectedErrors: (string | RegExp)[],
  optionalErrors: (string | RegExp)[] = [],
) => {
  await waitFor(
    () => {
      const messages = errorHandler.mock.calls.map(([error]) => error?.message);
      expect(messages).toEqual(
        expect.arrayContaining(
          expectedErrors.map((message) =>
            message instanceof RegExp
              ? expect.stringMatching(message)
              : message,
          ),
        ),
      );
      expect(
        messages.filter(
          (message) =>
            ![...expectedErrors, ...optionalErrors].some((pattern) =>
              pattern instanceof RegExp
                ? typeof message === 'string' && pattern.test(message)
                : message === pattern,
            ),
        ),
      ).toEqual([]);
    },
    { timeout: MOUNT_TIMEOUT },
  );
};
