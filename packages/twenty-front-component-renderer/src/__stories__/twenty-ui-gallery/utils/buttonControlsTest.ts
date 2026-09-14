import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const buttonControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  const canvas = within(context.canvasElement);
  const button = await canvas.findByRole(
    'button',
    { name: 'Create record' },
    { timeout: 10000 },
  );
  await userEvent.click(button);
  button.focus();
  await userEvent.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('3'),
  );
  const disabled = canvas.getByRole('button', { name: 'Disabled button' });
  await expect(disabled).toBeDisabled();
  await userEvent.click(disabled);
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('3'),
  );
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.click(save);
  await waitFor(() => expect(save).toBeDisabled());
  await userEvent.click(
    canvas.getByRole('button', { name: 'Complete request' }),
  );
  await waitFor(() => expect(save).toBeEnabled());
  await expect(
    canvas.getByRole('link', { name: 'Documentation' }),
  ).toHaveAttribute('href', 'https://twenty.com');
  await userEvent.click(canvas.getByRole('button', { name: 'Second action' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('4'),
  );
};
