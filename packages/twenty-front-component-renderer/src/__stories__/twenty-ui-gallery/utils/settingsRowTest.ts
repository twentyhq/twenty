import { expect, userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const settingsRowTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  await expect(
    canvas.getByRole('switch', { name: 'Notifications' }),
  ).toHaveAccessibleDescription('Updates by email');
  await userEvent.click(canvas.getByText('Disabled notifications'));
  await userEvent.click(
    canvas.getByRole('switch', { name: 'Disabled notifications' }),
  );
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: disabled; Changes: 0',
  );

  await userEvent.click(canvas.getByText('Notifications'));

  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.NATIVE_EVENT_DEFAULT_PREVENTED],
    allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.ELEMENT_REF_FOCUS],
  });
};
