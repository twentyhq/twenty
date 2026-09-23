import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const resizeHandleTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const handle = canvas.getByRole('separator', { name: 'Resize example' });

  handle.focus();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(handle).toHaveAttribute('aria-valuenow', '110');
    expect(canvas.getByText('110 pixels')).toBeVisible();
  });
  await userEvent.keyboard('{End}');
  await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '200'));
};
