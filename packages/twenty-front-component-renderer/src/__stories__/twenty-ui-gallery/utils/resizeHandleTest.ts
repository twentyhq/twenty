import {
  expect,
  fireEvent,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

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

  const capturedPointers = new Set<number>();
  const setPointerCapture = spyOn(
    handle,
    'setPointerCapture',
  ).mockImplementation((pointerId) => {
    capturedPointers.add(pointerId);
  });
  const hasPointerCapture = spyOn(
    handle,
    'hasPointerCapture',
  ).mockImplementation((pointerId) => capturedPointers.has(pointerId));
  const releasePointerCapture = spyOn(
    handle,
    'releasePointerCapture',
  ).mockImplementation((pointerId) => {
    capturedPointers.delete(pointerId);
  });
  const pointer = userEvent.setup();

  try {
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
      await expect(setPointerCapture).toHaveBeenLastCalledWith(1);
      await expect(handle).toHaveFocus();
      await pointer.pointer({ target: handle, coords: { y: 80 } });
      await waitFor(() => {
        expect(handle).toHaveAttribute('aria-valuenow', '180');
        expect(canvas.getByText('180 pixels')).toBeVisible();
      });
      await fireEvent[endEvent](handle, { pointerId: 1 });
      await pointer.pointer({ target: handle, coords: { y: 0 } });
      await pointer.pointer({ target: handle, keys: '[/MouseLeft]' });
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() =>
        expect(handle).toHaveAttribute('aria-valuenow', '190'),
      );
      await userEvent.keyboard('{End}');
      await waitFor(() =>
        expect(handle).toHaveAttribute('aria-valuenow', '200'),
      );
    }
    await expect(releasePointerCapture).toHaveBeenCalledWith(1);
    await expect(errorHandler).not.toHaveBeenCalled();
  } finally {
    setPointerCapture.mockRestore();
    hasPointerCapture.mockRestore();
    releasePointerCapture.mockRestore();
  }
};
