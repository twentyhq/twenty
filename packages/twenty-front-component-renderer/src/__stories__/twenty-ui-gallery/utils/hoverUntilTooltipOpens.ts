import { type userEvent } from 'storybook/test';

import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

// A hover that lands while the sandbox is still attaching its listeners, or finishing the
// last close, is lost on a busy runner: each one is retried until the tooltip opens
export const hoverUntilTooltipOpens = async ({
  user,
  hoverTarget,
  expectTooltipOpen,
}: {
  user: ReturnType<typeof userEvent.setup>;
  hoverTarget: Element;
  expectTooltipOpen: () => Promise<unknown>;
}) => {
  const deadline = Date.now() + MOUNT_TIMEOUT;

  for (;;) {
    await user.hover(hoverTarget);

    try {
      await expectTooltipOpen();

      return;
    } catch (error) {
      if (Date.now() > deadline) {
        throw error;
      }
    }

    await user.unhover(hoverTarget);
  }
};
