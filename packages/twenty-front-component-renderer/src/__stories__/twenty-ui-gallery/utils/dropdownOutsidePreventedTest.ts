import { expect, userEvent, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createDropdownTestContext } from '@/__stories__/twenty-ui-gallery/utils/createDropdownTestContext';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const dropdownOutsidePreventedTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const { canvas, page, trigger, openMenu, expectMenuClosed } =
      await createDropdownTestContext(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Prevent outside dismissal' }),
    );
    await openMenu();
    const outsideAction = canvas.getByRole('button', { name: 'Host action' });
    await userEvent.click(outsideAction);
    await waitFor(() =>
      expect(
        canvas.getByRole('status', { name: 'Outside presses' }),
      ).toHaveTextContent('Outside presses: 1'),
    );
    expect(outsideAction).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(page.getByRole('menu', { name: 'Record actions' })).toBeVisible();
    await userEvent.click(trigger);
    await expectMenuClosed();
    expect(errorHandler).not.toHaveBeenCalled();
  };
