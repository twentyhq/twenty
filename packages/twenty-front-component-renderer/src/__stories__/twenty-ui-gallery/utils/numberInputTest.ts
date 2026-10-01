import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const numberInputTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole('textbox', { name: 'Quantity' });
  const increment = canvas.getByRole('button', { name: 'Increase value' });
  const decrement = canvas.getByRole('button', { name: 'Decrease value' });
  const status = canvas.getByRole('status');

  expect(input).toHaveValue('3');
  expect(input).toHaveAccessibleDescription('Choose up to five items');
  expect(increment).toHaveAttribute('type', 'button');
  expect(decrement).toHaveAttribute('type', 'button');
  expect(
    canvas.getByRole('textbox', { name: 'Disabled quantity' }),
  ).toBeDisabled();

  const readOnlyInput = canvas.getByRole('textbox', {
    name: 'Read-only quantity',
  });
  expect(readOnlyInput).toHaveAttribute('readonly');
  await userEvent.type(readOnlyInput, '9');
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Increase disabled quantity' }),
  );
  expect(readOnlyInput).toHaveValue('4');
  expect(status).toHaveTextContent('Value: 3; Changes: 0; Submissions: 0');

  await userEvent.click(input);
  await waitFor(() => expect(input).toHaveFocus());
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(status).toHaveTextContent('Value: 2; Changes: 1; Submissions: 0'),
  );
  await userEvent.keyboard('{Home}');
  await waitFor(() => expect(decrement).toBeDisabled());
  await userEvent.keyboard('{ArrowDown}');
  await expect(status).toHaveTextContent(
    'Value: 0; Changes: 2; Submissions: 0',
  );
  await userEvent.keyboard('{End}');
  await waitFor(() =>
    expect(status).toHaveTextContent('Value: 5; Changes: 3; Submissions: 0'),
  );
  expect(increment).toBeDisabled();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(status).toHaveTextContent('Value: 4; Changes: 4; Submissions: 0'),
  );

  const form = canvas.getByRole('form', { name: 'Quantity form' });
  expect(form).toBeInstanceOf(HTMLFormElement);
  const formData = new FormData(form as HTMLFormElement);
  expect(formData.get('quantity')).toBe('4');
  expect(formData.get('readOnlyQuantity')).toBe('4');
  expect(formData.has('disabledQuantity')).toBe(false);
  expect(errorHandler).not.toHaveBeenCalled();
};
