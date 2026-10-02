import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const dropdownPreactSandboxFailureTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const trigger = canvas.getByRole('button', { name: 'Choose assignee' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    await expect(
      waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'), {
        timeout: INTERACTION_TIMEOUT,
      }),
    ).rejects.toThrow();
    expect(errorHandler).not.toHaveBeenCalled();
  };
