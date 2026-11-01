import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const autocompletePartsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByLabelText<HTMLInputElement>('Account owner');
  const trigger = canvas.getByRole('button', { name: 'Show people' });
  const callbacks = canvas.getByRole('status', { name: 'Owner callbacks' });
  const value = canvas.getByRole('status', { name: 'Owner value' });
  const selection = canvas.getByRole('status', { name: 'Owner selection' });

  await expect(input.tagName).toBe('INPUT');
  await expect(input).toHaveAttribute('data-native-owner', 'account-owner');
  await expect(input).toHaveAttribute('name', 'accountOwner');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  await expect(input).toHaveAttribute('role', 'combobox');
  const popup = await page.findByRole('region', { name: 'People suggestions' });
  await expect(popup.tagName).toBe('SECTION');
  await waitFor(() => expect(popup).toBeVisible());
  await expect(popup.closest('[data-autocomplete-positioner]')).toHaveStyle({
    position: 'fixed',
  });
  await expect(page.getByRole('group', { name: 'Sales' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Support' })).toBeVisible();
  await expect(page.getAllByRole('option')).toHaveLength(3);

  await fireEvent.input(input, { target: { value: 'Bob' } });
  const bob = await page.findByRole('option', { name: 'Bob Smith' });
  await waitFor(() => expect(page.getAllByRole('option')).toHaveLength(1));
  await expect(callbacks).toHaveTextContent(
    /Change: input-change\/(input|change)/,
  );
  await expect(callbacks).toHaveTextContent('Input: account-owner');
  await expect(value).toHaveTextContent('Bob');
  await userEvent.click(bob);
  await waitFor(() => expect(input).toHaveValue('Bob Smith'));
  await expect(selection).toHaveTextContent('Bob Smith; Selections: 1');
  await expect(callbacks).toHaveTextContent('Change: item-press/click');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );

  await userEvent.click(
    await canvas.findByRole('button', { name: 'Set Carol' }),
  );
  await waitFor(() => expect(input).toHaveValue('Carol Wilson'));
  await expect(value).toHaveTextContent('Carol Wilson');
  await userEvent.click(canvas.getByRole('button', { name: 'Clear people' }));
  await waitFor(() => expect(input).toHaveValue(''));
  await expect(callbacks).toHaveTextContent('Change: clear-press/click');
  await expect(value).toHaveTextContent('empty');

  await userEvent.click(input);
  await fireEvent.input(input, { target: { value: 'Nobody' } });
  await waitFor(() =>
    expect(page.getByText('No matching people.')).toBeVisible(),
  );
  await expect(page.queryAllByRole('option')).toHaveLength(0);
  await expect(selection).toHaveTextContent('Bob Smith; Selections: 1');
  await expect(errorHandler).not.toHaveBeenCalled();
};
