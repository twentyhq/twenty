import { userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type SandboxErrorExpectation } from '@/__stories__/twenty-ui-gallery/types/SandboxErrorExpectation';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

type CreateSandboxFailureTestOptions = SandboxErrorExpectation & {
  trigger:
    | { type: 'mount' }
    | {
        type: 'click';
        role: 'button' | 'combobox' | 'switch' | 'tab';
        name: string;
      };
};

export const createSandboxFailureTest =
  ({
    trigger,
    requiredErrors,
    allowedAdditionalErrors,
  }: CreateSandboxFailureTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    // Some failures prevent mounting; only interaction tests can await the card.
    if (trigger.type === 'click') {
      const canvas = within(canvasElement);
      await expectFrontComponentMounted(canvas);
      await userEvent.click(
        canvas.getByRole(trigger.role, { name: trigger.name }),
      );
    }
    await expectSandboxErrors({ requiredErrors, allowedAdditionalErrors });
  };
