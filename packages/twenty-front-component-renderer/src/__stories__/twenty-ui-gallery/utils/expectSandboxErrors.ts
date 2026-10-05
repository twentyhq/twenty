import { isString } from '@sniptt/guards';
import { expect, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type SandboxErrorExpectation } from '@/__stories__/twenty-ui-gallery/types/SandboxErrorExpectation';

const matchesErrorMessage = (message: unknown, pattern: string | RegExp) =>
  isString(message) &&
  (isString(pattern) ? message === pattern : message.search(pattern) !== -1);

// Worker errors may be coalesced by the host's error state; require the
// triggering failure and reject errors outside the documented sandbox gaps.
export const expectSandboxErrors = async ({
  requiredErrors,
  allowedAdditionalErrors = [],
}: SandboxErrorExpectation): Promise<void> => {
  const allowedErrors = [...requiredErrors, ...allowedAdditionalErrors];

  await waitFor(
    () => {
      const messages = errorHandler.mock.calls.map(([error]) => error?.message);
      const missingRequiredErrors = requiredErrors.filter(
        (pattern) =>
          !messages.some((message) => matchesErrorMessage(message, pattern)),
      );
      const unexpectedMessages = messages.filter(
        (message) =>
          !allowedErrors.some((pattern) =>
            matchesErrorMessage(message, pattern),
          ),
      );

      expect(missingRequiredErrors).toEqual([]);
      expect(unexpectedMessages).toEqual([]);
    },
    { timeout: MOUNT_TIMEOUT },
  );
};
