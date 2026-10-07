import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const numberStepperSelectionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const quantityState = canvas.getByRole('status', { name: 'Quantity state' });
  await userEvent.click(canvas.getByRole('button', { name: 'Increase value' }));
  await waitFor(() =>
    expect(quantityState).toHaveTextContent(
      'Value: 4; Changes: 1; Submissions: 0',
    ),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Decrease value' }));
  await waitFor(() =>
    expect(quantityState).toHaveTextContent(
      'Value: 3; Changes: 2; Submissions: 0',
    ),
  );

  const amount = canvas.getByRole<HTMLInputElement>('textbox', {
    name: 'Editable amount',
  });
  const editingState = canvas.getByRole('status', { name: 'Editing state' });
  await userEvent.click(amount);
  amount.setSelectionRange(1, 3, 'backward');
  await userEvent.paste('6');
  await waitFor(() =>
    expect(editingState).toHaveTextContent('Amount: 164; Changes: 1'),
  );
  await waitFor(() => {
    expect(amount).toHaveValue('164');
    expect(amount.selectionStart).toBe(2);
    expect(amount.selectionEnd).toBe(2);
  });
  await userEvent.keyboard('7');
  await waitFor(() =>
    expect(editingState).toHaveTextContent('Amount: 1674; Changes: 2'),
  );
  await waitFor(() => expect(amount.selectionStart).toBe(3));
  expect(errorHandler).not.toHaveBeenCalled();
};
