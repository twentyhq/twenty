import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

const createDisplayControlTest =
  (
    buttonName: string,
    disabledButtonName: string,
    staticContent: string,
    checkGallery: TwentyUiGalleryPlayFunction = galleryRenderTest,
  ): TwentyUiGalleryPlayFunction =>
  async (context) => {
    await checkGallery(context);
    const canvas = within(context.canvasElement);
    await expect(canvas.getByText(staticContent)).toBeVisible();
    const button = canvas.getByRole('button', { name: buttonName });
    await userEvent.click(button);
    await waitFor(() =>
      expect(canvas.getByLabelText('Activations')).toHaveTextContent('1'),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByLabelText('Activations')).toHaveTextContent('2'),
    );
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(canvas.getByLabelText('Activations')).toHaveTextContent('3'),
    );
    await expect(button).toHaveFocus();
    const disabledButton = canvas.getByRole('button', {
      name: disabledButtonName,
    });
    await expect(disabledButton).toBeDisabled();
    await userEvent.click(disabledButton);
    await expect(canvas.getByLabelText('Activations')).toHaveTextContent('3');
  };

export const statusControlsTest = createDisplayControlTest(
  'Open status',
  'Disabled status',
  'Loading status',
);
