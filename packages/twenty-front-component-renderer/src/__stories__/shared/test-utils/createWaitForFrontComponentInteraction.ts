import { waitFor } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

export const createWaitForFrontComponentInteraction =
  (container: HTMLElement) => (assertion: () => void | Promise<void>) =>
    waitFor(assertion, { container, timeout: INTERACTION_TIMEOUT });
