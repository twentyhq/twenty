import { expect, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { loaderTest } from '@/__stories__/twenty-ui-gallery/utils/loaderTest';

export const bannerTest: TwentyUiGalleryPlayFunction = async (context) => {
  await loaderTest(context);
  const canvas = within(context.canvasElement);
  const banner = canvas.getByRole('status', { name: 'Banner result' });
  await waitFor(() =>
    expect(banner).toHaveAttribute('data-ref-tag', 'HTML-SECTION'),
  );
  await expect(banner.tagName).toBe('SECTION');
  await expect(banner).toHaveAttribute('data-status', 'error');
  await expect(banner).toHaveAttribute('data-color', 'blue');
  await expect(banner).toHaveAttribute('data-variant', 'soft');
  await expect(banner).toHaveAttribute('data-composed', 'true');
  await expect(banner).toHaveAttribute('aria-live', 'polite');
  await expect(banner).toHaveClass('custom-banner');
  await expect(banner).toHaveStyle({ marginTop: '7px' });
  const inlineBanner = canvas.getByTestId('gallery-item-InlineBanner');
  await expect(inlineBanner.querySelector('[data-status]')).not.toHaveAttribute(
    'role',
  );
  await expect(inlineBanner.querySelector('[data-status]')).not.toHaveAttribute(
    'aria-live',
  );
};
