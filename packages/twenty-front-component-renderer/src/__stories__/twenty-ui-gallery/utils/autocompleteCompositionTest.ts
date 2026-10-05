import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const autocompleteCompositionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole<HTMLInputElement>('combobox', {
    name: 'Fruit',
  });
  const state = canvas.getByRole('status', { name: 'Autocomplete state' });
  const selection = canvas.getByRole('status', { name: 'Selected fruit' });

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
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
      which: 229,
      isComposing: true,
    }),
  );
  input.dispatchEvent(
    new KeyboardEvent('keyup', {
      bubbles: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 229,
      which: 229,
      isComposing: true,
    }),
  );
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Composition confirmations' }),
    ).toHaveTextContent('1'),
  );
  await expect(state).toHaveTextContent(
    'Query: empty; Changes: 0; Submissions: 0',
  );
  await expect(input).toHaveValue('か');
  await expect(selection).toHaveTextContent('None; Selections: 0');
  await expect(apple).toBeVisible();

  input.dispatchEvent(
    new CompositionEvent('compositionend', {
      bubbles: true,
      data: 'か',
    }),
  );
  await waitFor(() =>
    expect(state).toHaveTextContent('Query: か; Changes: 1; Submissions: 0'),
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
    expect(selection).toHaveTextContent('かき; Selections: 1'),
  );
  await expect(state).toHaveTextContent(
    'Query: か; Changes: 1; Submissions: 0',
  );
  await expect(input).toHaveValue('か');
  await expect(errorHandler).not.toHaveBeenCalled();
};
