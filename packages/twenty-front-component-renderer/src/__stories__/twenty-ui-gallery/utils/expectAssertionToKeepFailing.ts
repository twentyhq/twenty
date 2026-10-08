import { expect, waitFor } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

export const expectAssertionToKeepFailing = async (
  assertion: () => void,
): Promise<void> => {
  await expect(
    waitFor(assertion, { timeout: INTERACTION_TIMEOUT }),
  ).rejects.toThrow();
};
