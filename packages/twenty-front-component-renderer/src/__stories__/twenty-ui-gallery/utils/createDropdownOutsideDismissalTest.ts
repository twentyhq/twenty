import { expect, userEvent, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownTestContext } from '@/__stories__/twenty-ui-gallery/utils/createDropdownTestContext';

export const createDropdownOutsideDismissalTest =
  ({
    target,
    shouldUseCustomContainer = false,
  }: {
    target: 'worker' | 'host';
    shouldUseCustomContainer?: boolean;
  }): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const { canvas, trigger, openMenu, expectMenuClosed } =
      await createDropdownTestContext(canvasElement);
    const outsideActionName =
      target === 'worker' ? 'Outside menu' : 'Host action';
    const actionStatusName =
      target === 'worker' ? 'Outside actions' : 'Host actions';

    if (shouldUseCustomContainer) {
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
    await waitFor(
      () =>
        expect(
          canvas.getByRole('status', { name: actionStatusName }),
        ).toHaveTextContent(`${actionStatusName}: 1`),
      { timeout: INTERACTION_TIMEOUT },
    );

    await openMenu();
    await userEvent.click(trigger);
    await expectMenuClosed();
    expect(errorHandler).not.toHaveBeenCalled();
  };
