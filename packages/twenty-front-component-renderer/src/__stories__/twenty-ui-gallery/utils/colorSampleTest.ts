import { expect, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const colorSampleTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const swatch = canvas.getByRole('img', { name: 'Brand blue' });

  await waitFor(() =>
    expect(swatch).toHaveAttribute('data-ref-tag', 'HTML-SPAN'),
  );
  await expect(swatch).toHaveAttribute('data-composed', 'true');
  await expect(swatch).toHaveClass('custom-swatch');
  await expect(swatch).toHaveStyle({ width: '24px', height: '16px' });
  await expect(canvas.getByRole('img', { name: 'Green' })).toHaveStyle({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  });
  const decorativeSwatch = canvas
    .getByTestId('gallery-item-DecorativeColorSample')
    .querySelector('[aria-hidden="true"]');

  await expect(decorativeSwatch).toHaveStyle({
    width: '12px',
    height: '16px',
    borderWidth: '1px',
  });
};
