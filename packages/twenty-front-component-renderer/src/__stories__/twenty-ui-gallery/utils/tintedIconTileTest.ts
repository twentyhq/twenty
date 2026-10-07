import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const tintedIconTileTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const tile = canvas.getByRole('img', { name: 'Custom company tile' });
  expect(tile).toHaveClass('custom-tile');
  expect(tile).toHaveAttribute('data-composed', 'tile');
  expect(tile.getBoundingClientRect().width).toBe(32);
  expect(tile.getBoundingClientRect().height).toBe(32);
  expect(tile.querySelector('svg')!.getBoundingClientRect().width).toBe(20);
  expect(canvas.queryByRole('img', { name: 'Internal artwork' })).toBeNull();
  await userEvent.click(canvas.getByRole('button', { name: 'Inspect tile' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Tile target')).toHaveTextContent('SPAN'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
