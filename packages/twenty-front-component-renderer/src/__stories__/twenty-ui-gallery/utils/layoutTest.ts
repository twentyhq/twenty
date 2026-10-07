import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { resizeHandleTest } from '@/__stories__/twenty-ui-gallery/utils/resizeHandleTest';

export const layoutTest: TwentyUiGalleryPlayFunction = async (context) => {
  await resizeHandleTest(context);
  const canvas = within(context.canvasElement);
  const horizontal = canvas.getByRole('separator', {
    name: 'Horizontal sections',
  });
  const vertical = canvas.getByRole('separator', { name: 'Vertical columns' });
  const composed = canvas.getByRole('separator', { name: 'Composed divider' });

  expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal');
  expect(horizontal.getBoundingClientRect().height).toBe(1);
  expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
  expect(vertical.getBoundingClientRect().width).toBe(1);
  expect(vertical.getBoundingClientRect().height).toBe(48);
  expect(composed.tagName).toBe('SPAN');
  expect(composed).toHaveAttribute('data-ref-target', 'separator');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Change divider orientation' }),
  );
  await waitFor(() => {
    expect(composed).toHaveAttribute('aria-orientation', 'vertical');
    expect(composed).toHaveAttribute('data-render-orientation', 'vertical');
  });
};
