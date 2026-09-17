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
  await expect(getComputedStyle(save).fontWeight).toBe('600');
  await expect(getComputedStyle(save).paddingInlineStart).toBe('12px');
  await userEvent.click(save);
  await waitFor(() => expect(save).toBeDisabled());
  const complete = canvas.getByRole('button', { name: 'Complete request' });
  await expect(getComputedStyle(complete).fontWeight).toBe('400');
  await expect(complete.getBoundingClientRect().height).toBe(24);
  await userEvent.click(complete);
  await waitFor(() => expect(save).toBeEnabled());
  await expect(
    canvas.getByRole('link', { name: 'Documentation' }),
  ).toHaveAttribute('href', 'https://twenty.com');
  await userEvent.click(canvas.getByRole('button', { name: 'Second action' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('4'),
  );
  const addItem = canvas.getByRole('button', { name: 'Add item' });
  await userEvent.click(addItem);
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('5'),
  );
  const unavailableItem = canvas.getByRole('button', {
    name: 'Unavailable item',
  });
  await expect(unavailableItem).toBeDisabled();
  await userEvent.click(unavailableItem);
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('5'),
  );
  await expect(addItem.getBoundingClientRect().width).toBe(20);
  await expect(
    unavailableItem.getBoundingClientRect().left -
      addItem.getBoundingClientRect().right,
  ).toBe(2);
  const send = canvas.getByRole('button', { name: 'Send' });
  await expect(send.getBoundingClientRect().width).toBe(20);
  await expect(getComputedStyle(send).borderTopLeftRadius).toBe('50%');
};
