import { expect, userEvent } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownTestContext } from '@/__stories__/twenty-ui-gallery/utils/createDropdownTestContext';

export const createDropdownOutsideDismissalTest =
  ({
    target,
    useCustomContainer = false,
  }: {
    target: 'worker' | 'host';
    useCustomContainer?: boolean;
  }): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const { canvas, trigger, openMenu, expectMenuClosed } =
      await createDropdownTestContext(canvasElement);
    const outsideActionName =
      target === 'worker' ? 'Outside menu' : 'Host action';
    const actionStatusName =
      target === 'worker' ? 'Outside actions' : 'Host actions';

    if (useCustomContainer) {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Render inside widget' }),
      );
    }

    await openMenu();
    const outsideAction = canvas.getByRole('button', {
      name: outsideActionName,
    });
    expectElementToReceivePointer(outsideAction);
    await userEvent.click(outsideAction);
    await expectMenuClosed();
    expect(outsideAction).toHaveFocus();
    expect(
      canvas.getByRole('status', { name: actionStatusName }),
    ).toHaveTextContent(`${actionStatusName}: 1`);

    await openMenu();
    await userEvent.click(trigger);
    await expectMenuClosed();
    expect(errorHandler).not.toHaveBeenCalled();
  };
