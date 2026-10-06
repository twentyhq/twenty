import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const inlineBannerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const banner = canvas.getByRole('status', { name: 'Inline sync result' });
  await waitFor(() =>
    expect(banner).toHaveAttribute('data-ref-tag', 'HTML-SECTION'),
  );
  await expect(banner.tagName).toBe('SECTION');
  await expect(banner).toHaveAttribute('data-status', 'error');
  await expect(banner).toHaveAttribute('data-render-status', 'error');
  await expect(banner).toHaveAttribute('data-color', 'blue');
  await expect(banner).toHaveAttribute('data-variant', 'solid');
  await expect(banner).toHaveAttribute('aria-live', 'polite');
  await expect(banner).toHaveClass('custom-inline-banner');
  await expect(banner).toHaveStyle({ marginTop: '7px' });
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
  const plainMessage = canvas.getByText('Mailbox needs attention.');
  await expect(plainMessage).toHaveFocus();
  const plainBanner = plainMessage.closest('[data-layout]');
  await expect(plainBanner).not.toHaveAttribute('role');
  await expect(plainBanner).not.toHaveAttribute('aria-live');
  await userEvent.tab();
  await expect(
    canvas.getByRole('link', { name: 'Review sync history' }),
  ).toHaveFocus();

  await expect(errorHandler).not.toHaveBeenCalled();
};
