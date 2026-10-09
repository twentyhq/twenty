import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const listItemPresentationTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const row = canvas.getByTestId('presentational-list-item');
  const content = within(row);

  expect(row.tagName).toBe('DIV');
  expect(row).toHaveAttribute('data-ref-tag', 'HTML-DIV');
  expect(row).not.toHaveAttribute('role');
  expect(row).not.toHaveAttribute('tabindex');
  expect(row).not.toHaveAttribute('aria-disabled');
  expect(row).toHaveAttribute('data-disabled');
  expect(row).toHaveAttribute('data-selected');
  expect(row).toHaveAttribute('data-highlighted');
  expect(content.queryByRole('link')).not.toBeInTheDocument();
  expect(
    within(canvas.getByTestId('plain-url-list-item')).queryByRole('link'),
  ).not.toBeInTheDocument();
  expect(content.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(content.getByText('Visual only')).toBeVisible();
  expect(content.getByText('End')).toBeVisible();
  expect(content.getByText('then')).toBeVisible();
  await userEvent.click(content.getByText('Preference'));
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Presentational activations'),
    ).toHaveTextContent('1'),
  );
  expect(
    canvas.getByLabelText('Presentational bubbled clicks'),
  ).toHaveTextContent('1');
  expect(row).not.toHaveFocus();
  await userEvent.click(content.getByRole('button', { name: 'Details' }));
  expect(canvas.getByLabelText('Presentational activations')).toHaveTextContent(
    '1',
  );
  expect(
    canvas.getByLabelText('Presentational bubbled clicks'),
  ).toHaveTextContent('1');
};
