import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const inlineBannerSandboxTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const button = canvas.getByRole('button', { name: 'Retry sync' });

  await userEvent.click(button);
  await expect(await canvas.findByText('Retry count: 1')).toBeVisible();
  await expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(await canvas.findByText('Retry count: 2')).toBeVisible();
  await userEvent.keyboard(' ');
  await expect(await canvas.findByText('Retry count: 3')).toBeVisible();
  await userEvent.tab();
  const link = canvas.getByRole('link', { name: 'Open connection settings' });

  await expect(link.tagName).toBe('A');
  await expect(link).toHaveFocus();
  await expect(link).toHaveAttribute('href', 'https://twenty.com');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(errorHandler).not.toHaveBeenCalled();
  await userEvent.tab();
  await expect(canvas.getByText('Mailbox needs attention.')).toHaveFocus();

  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  });
};
