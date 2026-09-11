import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

type CreateDisplayControlTestOptions = {
  buttonName: string;
  disabledButtonName: string;
  staticContent: string;
  checkGallery?: TwentyUiGalleryPlayFunction;
};

const createDisplayControlTest =
  ({
    buttonName,
    disabledButtonName,
    staticContent,
    checkGallery = galleryRenderTest,
  }: CreateDisplayControlTestOptions): TwentyUiGalleryPlayFunction =>
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

export const statusControlsTest = createDisplayControlTest({
  buttonName: 'Open status',
  disabledButtonName: 'Disabled status',
  staticContent: 'Loading status',
});
