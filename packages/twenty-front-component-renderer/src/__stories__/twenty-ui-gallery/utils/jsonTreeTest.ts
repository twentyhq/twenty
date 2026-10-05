import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const jsonTreeTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();
  const value = await canvas.findByRole(
    'button',
    { name: 'Copy this value' },
    { timeout: 10000 },
  );
  const activations = canvas.getByLabelText('Value activations');
  const parentClicks = canvas.getByLabelText('Parent clicks');

  await user.click(canvas.getByRole('button', { name: 'Before values' }));
  await user.tab();
  expect(value).toHaveFocus();
  expect(value).toHaveAttribute('type', 'button');
  expect(getComputedStyle(value).outlineStyle).toBe('solid');
  expect(value.getBoundingClientRect().height).toBe(24);
  await user.keyboard('{Enter}');
  await waitFor(() => expect(activations).toHaveTextContent('1'));
  await user.keyboard('[Space>]');
  expect(activations).toHaveTextContent('1');
  await user.keyboard('[/Space]');
  await waitFor(() => expect(activations).toHaveTextContent('2'));
  await user.click(value);
  await waitFor(() => {
    expect(activations).toHaveTextContent('3');
    expect(parentClicks).toHaveTextContent('3');
    expect(canvas.getByLabelText('Last value')).toHaveTextContent(
      'Copy this value',
    );
  });
  expect(value).toHaveFocus();
  const disabledValue = canvas.getByRole('button', { name: 'Disabled value' });
  expect(disabledValue).toBeDisabled();
  await user.click(disabledValue);
  value.focus();
  await user.tab();
  expect(canvas.getByRole('button', { name: 'After values' })).toHaveFocus();
  expect(activations).toHaveTextContent('3');
  expect(canvas.getByLabelText('Form submissions')).toHaveTextContent('0');

  expect(
    canvas.queryByRole('button', { name: 'Twenty' }),
  ).not.toBeInTheDocument();
  const collapseButtons = canvas.getAllByRole('button', { name: 'Collapse' });
  await user.click(collapseButtons[0]);
  await canvas.findByRole('button', { name: 'Expand' });
};
