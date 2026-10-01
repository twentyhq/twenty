import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const expandableListEventIsolationTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);

    const trigger = await canvas.findByRole('button', {
      name: 'Show all targets',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const popup = await page.findByRole('dialog', { name: 'Show all targets' });
    const lastTarget = within(popup).getByRole('button', { name: 'Delta' });
    await waitFor(() => expect(lastTarget).toBeVisible());
    await expect(canvas.getByLabelText('Host activations')).toHaveTextContent(
      '0',
    );

    await userEvent.click(lastTarget);
    await waitFor(() =>
      expect(canvas.getByLabelText('Selected target')).toHaveTextContent(
        'Delta',
      ),
    );
    await expect(canvas.getByLabelText('Host activations')).toHaveTextContent(
      '0',
    );
    await expect(errorHandler).not.toHaveBeenCalled();
  };
