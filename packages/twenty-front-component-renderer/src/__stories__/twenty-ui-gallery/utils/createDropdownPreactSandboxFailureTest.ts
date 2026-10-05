import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectAssertionToKeepFailing } from '@/__stories__/twenty-ui-gallery/utils/expectAssertionToKeepFailing';

type CreateDropdownPreactSandboxFailureTestOptions = {
  triggerName: string;
};

export const createDropdownPreactSandboxFailureTest =
  ({
    triggerName,
  }: CreateDropdownPreactSandboxFailureTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const trigger = canvas.getByRole('button', { name: triggerName });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    await expectAssertionToKeepFailing(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true'),
    );
    expect(errorHandler).not.toHaveBeenCalled();
  };
