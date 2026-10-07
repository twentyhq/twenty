import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectCaretAt } from '@/__stories__/twenty-ui-gallery/utils/expectCaretAt';

export const autocompleteInputTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole<HTMLInputElement>('combobox', {
    name: 'Fruit',
  });
  const autocompleteState = canvas.getByRole('status', {
    name: 'Autocomplete state',
  });
  const disabledInput = canvas.getByLabelText('Disabled fruit');

  await expect(disabledInput).toBeDisabled();
  await userEvent.type(disabledInput, 'Banana');
  await expect(disabledInput).toHaveValue('Cherry');
  await userEvent.click(input);
  await userEvent.keyboard('{Home}');
  await expectCaretAt({ input, offset: 0 });
  await userEvent.keyboard('{End}');
  await expectCaretAt({ input, offset: 5 });
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}x');
  await waitFor(() => expect(input).toHaveValue('Appxle'));
  await expectCaretAt({ input, offset: 4 });
  await expect(autocompleteState).toHaveTextContent(
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
