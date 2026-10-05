import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const autocompleteInputTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole<HTMLInputElement>('combobox', {
    name: 'Fruit',
  });
  const state = canvas.getByRole('status', { name: 'Autocomplete state' });
  const disabledInput = canvas.getByLabelText('Disabled fruit');

  await expect(disabledInput).toBeDisabled();
  await userEvent.type(disabledInput, 'Banana');
  await expect(disabledInput).toHaveValue('Cherry');
  await userEvent.click(input);
  await userEvent.keyboard('{Home}');
  await waitFor(() => {
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);
  });
  await userEvent.keyboard('{End}');
  await waitFor(() => {
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}x');
  await waitFor(() => expect(input).toHaveValue('Appxle'));
  await waitFor(() => {
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
  });
  await expect(state).toHaveTextContent(
    'Query: Appxle; Changes: 1; Submissions: 0',
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Remove autocomplete' }),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('combobox', { name: 'Fruit' })).toBeNull(),
  );
  await expect(disabledInput).toHaveValue('Cherry');
  await expect(errorHandler).not.toHaveBeenCalled();
};
