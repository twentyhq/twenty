import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const avatarControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const imageEntry = within(canvas.getByTestId('gallery-item-AvatarImage'));

  await expect(imageEntry.getByText('I')).toBeVisible();
  await expect(imageEntry.queryByRole('presentation')).not.toBeInTheDocument();
  await expect(canvas.getByText('A')).toBeVisible();

  const avatar = canvas.getByRole('button', { name: 'Jane' });
  const activations = canvas.getByLabelText('Activations');

  await userEvent.click(avatar);
  await waitFor(() => expect(activations).toHaveTextContent('1'));
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(activations).toHaveTextContent('2'));
  await userEvent.keyboard(' ');
  await waitFor(() => expect(activations).toHaveTextContent('3'));
  await expect(avatar).toHaveFocus();

  const disabledAvatar = canvas.getByRole('button', {
    name: 'Disabled avatar',
  });

  await expect(disabledAvatar).toBeDisabled();
  await userEvent.click(disabledAvatar);
  await expect(activations).toHaveTextContent('3');
};
