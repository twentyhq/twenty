import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { dispatchComposingEnterKeyPress } from '@/__stories__/twenty-ui-gallery/utils/dispatchComposingEnterKeyPress';

export const autocompleteCompositionTest: TwentyUiGalleryPlayFunction = async ({
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
  const selectedFruitState = canvas.getByRole('status', {
    name: 'Selected fruit',
  });
  const compositionConfirmations = canvas.getByRole('status', {
    name: 'Composition confirmations',
  });

  await userEvent.click(canvas.getByRole('button', { name: 'Reset search' }));
  await waitFor(() => expect(input).toHaveValue(''));
  await userEvent.click(input);
  const apple = await canvas.findByRole('option', { name: 'Apple' });
  await waitFor(() =>
    expect(input).toHaveAttribute('aria-activedescendant', apple.id),
  );

  input.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true }),
  );
  await fireEvent.input(input, {
    target: { value: 'か' },
    data: 'か',
    inputType: 'insertCompositionText',
    isComposing: true,
  });
  await waitFor(() => expect(input).toHaveValue('か'));
  dispatchComposingEnterKeyPress(input);
  await waitFor(() => expect(compositionConfirmations).toHaveTextContent('1'));
  await expect(autocompleteState).toHaveTextContent(
    'Query: empty; Changes: 0; Submissions: 0',
  );
  await expect(input).toHaveValue('か');
  await expect(selectedFruitState).toHaveTextContent('None; Selections: 0');
  await expect(apple).toBeVisible();

  input.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true, data: 'か' }),
  );
  await waitFor(() =>
    expect(autocompleteState).toHaveTextContent(
      'Query: か; Changes: 1; Submissions: 0',
    ),
  );
  const persimmon = await canvas.findByRole('option', { name: 'かき' });
  await waitFor(() =>
    expect(input).toHaveAttribute('aria-activedescendant', persimmon.id),
  );
  await expect(input).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(persimmon).toHaveAttribute('data-highlighted'));
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(selectedFruitState).toHaveTextContent('かき; Selections: 1'),
  );
  await expect(autocompleteState).toHaveTextContent(
    'Query: か; Changes: 1; Submissions: 0',
  );
  await expect(input).toHaveValue('か');
  await expect(errorHandler).not.toHaveBeenCalled();
};
