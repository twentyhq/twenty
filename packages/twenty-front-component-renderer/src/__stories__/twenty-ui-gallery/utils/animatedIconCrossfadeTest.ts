import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const animatedIconCrossfadeTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const icon = canvas.getByRole('img', { name: 'Selection inactive' });
  const active = canvas.getByTestId('active-artwork');
  const inactive = canvas.getByTestId('inactive-artwork');
  expect(icon).toHaveClass('custom-crossfade');
  expect(icon).toHaveAttribute('data-composed', 'crossfade');
  expect(icon.getBoundingClientRect().width).toBe(16);
  expect(icon.getBoundingClientRect().height).toBe(16);
  expect(getComputedStyle(active.parentElement!).opacity).toBe('0');
  expect(getComputedStyle(inactive.parentElement!).opacity).toBe('1');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Toggle selection' }),
  );
  await waitFor(() => {
    expect(icon).toHaveAccessibleName('Selection active');
    expect(getComputedStyle(active.parentElement!).opacity).toBe('1');
    expect(getComputedStyle(inactive.parentElement!).opacity).toBe('0');
    expect(canvas.getByLabelText('Crossfade target')).toHaveTextContent('SPAN');
  });
  expect(canvas.getByTestId('active-artwork')).toBe(active);
  expect(canvas.getByTestId('inactive-artwork')).toBe(inactive);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Toggle selection' }),
  );
  await waitFor(() => {
    expect(icon).toHaveAccessibleName('Selection inactive');
    expect(getComputedStyle(inactive.parentElement!).opacity).toBe('1');
  });
  expect(errorHandler).not.toHaveBeenCalled();
};
