import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const iconButtonFloatingTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole(
    'button',
    { name: 'Add widget' },
    { timeout: 10000 },
  );

  await expect(button).toHaveAttribute('type', 'button');
  await waitFor(() => {
    expect(button.getBoundingClientRect().width).toBe(24);
    expect(button.getBoundingClientRect().height).toBe(24);
    expect(getComputedStyle(button).boxShadow).not.toBe('none');
    expect(getComputedStyle(button).backdropFilter).not.toBe('none');
  });
  await userEvent.click(button);
  button.focus();
  await userEvent.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Widget activations')).toHaveTextContent('3'),
  );

  for (const name of ['Disabled widget action', 'Saving widget']) {
    const disabledButton = canvas.getByRole('button', { name });

    await expect(disabledButton).toBeDisabled();
    await userEvent.click(disabledButton);
  }

  await expect(
    canvas.getByRole('button', { name: 'Saving widget' }),
  ).toHaveAttribute('aria-busy', 'true');
  await expect(canvas.getByLabelText('Widget activations')).toHaveTextContent(
    '3',
  );

  const link = canvas.getByRole('link', { name: 'Browse widgets' });

  await expect(link).toHaveAttribute('href', 'https://twenty.com');
  await expect(link.getBoundingClientRect().width).toBe(32);
  await expect(getComputedStyle(link).boxShadow).toBe('none');
  await expect(getComputedStyle(link).backdropFilter).toBe('none');
};
