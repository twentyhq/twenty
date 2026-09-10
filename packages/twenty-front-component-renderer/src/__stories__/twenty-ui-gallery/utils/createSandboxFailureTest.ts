import { userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

type SandboxFailureTestOptions = {
  trigger?: { role: 'button' | 'combobox' | 'switch' | 'tab'; name: string };
  expectedErrors: (string | RegExp)[];
  optionalErrors?: (string | RegExp)[];
};

export const createSandboxFailureTest =
  ({
    trigger,
    expectedErrors,
    optionalErrors,
  }: SandboxFailureTestOptions): TwentyUiGalleryStory['play'] =>
  async ({ canvasElement }) => {
    // Some failures prevent mounting; only interaction tests can await the card.
    if (trigger) {
      const canvas = within(canvasElement);
      await expectFrontComponentMounted(canvas);
      await userEvent.click(
        canvas.getByRole(trigger.role, { name: trigger.name }),
      );
    }
    await expectSandboxErrors(expectedErrors, optionalErrors);
  };
