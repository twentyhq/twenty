import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const createDirectionalPopupTest =
  (family: 'Menu' | 'Dropdown' | 'Tooltip'): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole(
      'button',
      {
        name:
          family === 'Tooltip'
            ? 'Tooltip target'
            : `Open ${family.toLowerCase()}`,
      },
      { timeout: MOUNT_TIMEOUT },
    );
    const body = within(canvasElement.ownerDocument.body);
    if (family === 'Tooltip') {
      await userEvent.hover(trigger);
      const tooltip = await body.findByRole('tooltip');
      expect(getComputedStyle(tooltip).direction).toBe('rtl');
      expect(errorHandler).not.toHaveBeenCalled();
      return;
    }
    await userEvent.click(trigger);
    const submenuTrigger = await body.findByRole('menuitem', {
      name: `${family} export`,
    });
    expect(getComputedStyle(submenuTrigger).direction).toBe('rtl');
    submenuTrigger.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: `${family} CSV` }),
      ).toHaveFocus(),
    );
    expect(errorHandler).not.toHaveBeenCalled();
  };
