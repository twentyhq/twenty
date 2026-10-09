import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const listItemButtonTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();
  const summary = canvas.getByRole('button', {
    name: /^Daily summary\s*Action row$/,
  });

  expect(summary.tagName).toBe('BUTTON');
  expect(summary).toHaveAttribute('type', 'button');
  expect(summary).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  await user.click(summary);
  await waitFor(() =>
    expect(canvas.getByLabelText('Summary state')).toHaveTextContent('enabled'),
  );
  expect(summary).toHaveAttribute('aria-pressed', 'true');
  expect(canvas.getByLabelText('Summary click target')).toHaveTextContent(
    'click:HTML-BUTTON',
  );
  expect(canvas.getByLabelText('Summary focus target')).toHaveTextContent(
    'HTML-BUTTON',
  );
  expect(summary).toHaveFocus();
  await user.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Summary activations')).toHaveTextContent('3'),
  );
  expect(canvas.getByLabelText('Summary bubbled clicks')).toHaveTextContent(
    '3',
  );
  expect(canvas.getByLabelText('Summary last key')).toHaveTextContent('Space');

  const disabled = canvas.getByRole('button', { name: 'Unavailable summary' });
  expect(disabled).toBeDisabled();
  disabled.focus();
  expect(disabled).not.toHaveFocus();
  await user.click(disabled);
  expect(canvas.getByLabelText('Summary activations')).toHaveTextContent('3');

  const focusable = canvas.getByRole('button', {
    name: 'Focusable unavailable summary',
  });
  expect(focusable).not.toBeDisabled();
  expect(focusable).toHaveAttribute('aria-disabled', 'true');
  focusable.focus();
  expect(focusable).toHaveFocus();
  await user.keyboard('{Enter} ');
  await user.click(focusable);
  expect(canvas.getByLabelText('Summary activations')).toHaveTextContent('3');
  expect(canvas.getByLabelText('Summary bubbled clicks')).toHaveTextContent(
    '6',
  );

  await user.click(canvas.getByRole('button', { name: 'Isolated summary' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Summary isolated clicks')).toHaveTextContent(
      '1',
    ),
  );
  expect(canvas.getByLabelText('Summary bubbled clicks')).toHaveTextContent(
    '6',
  );

  const details = canvas.getByRole('button', { name: 'Summary details' });
  const openSummary = canvas.getByRole('button', { name: 'Open summary' });
  expect(openSummary.contains(details)).toBe(false);
  await user.click(details);
  await user.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Summary detail clicks')).toHaveTextContent(
      '3',
    ),
  );
  expect(details).toHaveFocus();
  expect(canvas.getByLabelText('Summary activations')).toHaveTextContent('3');
};
