import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';
import { withMockPointerCapture } from '@/__stories__/twenty-ui-gallery/utils/withMockPointerCapture';

export const resizeHandleTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const handle = canvas.getByRole('separator', { name: 'Resize example' });

  await waitFor(() =>
    expect(handle.getBoundingClientRect().height).toBeGreaterThan(0),
  );

  handle.focus();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(handle).toHaveAttribute('aria-valuenow', '110');
    expect(canvas.getByText('110 pixels')).toBeVisible();
  });
  await userEvent.keyboard('{End}');
  await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '200'));

  const pointer = userEvent.setup();

  await withMockPointerCapture({
    handles: [handle],
    run: async () => {
      for (const endEvent of [
        'pointerUp',
        'pointerCancel',
        'lostPointerCapture',
      ] as const) {
        handle.blur();
        await pointer.pointer({
          target: handle.firstElementChild!,
          keys: '[MouseLeft>]',
          coords: { y: 100 },
        });
        await expect(handle.setPointerCapture).toHaveBeenLastCalledWith(1);
        await expect(handle).not.toHaveFocus();
        await pointer.pointer({ target: handle, coords: { y: 80 } });
        await waitFor(() => {
          expect(handle).toHaveAttribute('aria-valuenow', '180');
          expect(canvas.getByText('180 pixels')).toBeVisible();
        });
        await fireEvent[endEvent](handle, { pointerId: 1, clientY: 80 });
        await pointer.pointer({ target: handle, coords: { y: 0 } });
        await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
        handle.focus();
        await userEvent.keyboard('{ArrowDown}');
        await waitFor(() =>
          expect(handle).toHaveAttribute('aria-valuenow', '190'),
        );
        await userEvent.keyboard('{End}');
        await waitFor(() =>
          expect(handle).toHaveAttribute('aria-valuenow', '200'),
        );
      }
      await expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
      await expect(errorHandler).not.toHaveBeenCalled();
    },
  });
};
