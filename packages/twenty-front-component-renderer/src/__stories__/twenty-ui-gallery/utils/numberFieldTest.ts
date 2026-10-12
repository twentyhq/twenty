import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const numberFieldTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const amount = canvas.getByRole<HTMLInputElement>('textbox', {
    name: 'Localized amount',
  });
  const amountState = canvas.getByRole('status', { name: 'Amount state' });
  const root = canvas.getByTestId('amount-root');
  const controls = canvas.getByRole('group', { name: 'Amount controls' });
  const form = canvas.getByRole<HTMLFormElement>('form', {
    name: 'Amount form',
  });

  expect(amount).toHaveValue('12,50');
  expect(amount).toHaveAttribute('type', 'text');
  expect(amount).toHaveAccessibleDescription(
    'Enter an amount using a decimal comma',
  );
  expect(controls.tagName).toBe('SECTION');
  expect(root).toHaveAttribute('data-value', '12.5');
  expect(new FormData(form).get('amount')).toBe('12.5');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Inspect amount refs' }),
  );
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Amount ref targets' }),
    ).toHaveTextContent('HTML-DIV/HTML-INPUT:text/HTML-INPUT:number/12.5'),
  );

  await userEvent.click(amount);
  await waitFor(() => expect(amount).toHaveFocus());
  await userEvent.clear(amount);
  await waitFor(() => expect(amountState).toHaveTextContent('Value: empty'));
  expect(new FormData(form).get('amount')).toBe('');
  await waitFor(() => expect(amount).toHaveValue(''));
  await userEvent.paste('23,75');
  await waitFor(() => expect(amountState).toHaveTextContent('Value: 23.75'));
  expect(amountState).toHaveTextContent(
    /Change: input-(change|paste)\/(change|input|paste)\/function/,
  );
  expect(amountState).toHaveTextContent('Commit: none');
  await userEvent.tab();
  await waitFor(() =>
    expect(amountState).toHaveTextContent(
      /Commit: 23\.75\/input-blur\/(blur|focusout)/,
    ),
  );
  expect(amount).toHaveValue('23,75');
  expect(amount).toHaveAttribute('data-value', '23.75');
  expect(new FormData(form).get('amount')).toBe('23.75');

  await userEvent.click(amount);
  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() =>
    expect(amountState).toHaveTextContent('Commit: 24/keyboard/keydown'),
  );
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(amountState).toHaveTextContent('Commit: 23.75/keyboard/keydown'),
  );
  await waitFor(() => expect(amount).toHaveValue('23,75'));
  expect(new FormData(form).get('amount')).toBe('23.75');

  const quantity = canvas.getByRole('textbox', {
    name: 'Uncontrolled quantity',
  });
  const increment = canvas.getByRole('button', {
    name: 'Increase uncontrolled quantity',
  });
  const decrement = canvas.getByRole('button', {
    name: 'Decrease uncontrolled quantity',
  });
  expect(quantity).toHaveValue('2');
  await userEvent.click(increment);
  await waitFor(() => expect(quantity).toHaveValue('4'));
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Quantity details' }),
    ).toHaveTextContent('4/increment-press/pointerdown'),
  );
  expect(increment).toBeDisabled();
  await userEvent.click(quantity);
  await userEvent.keyboard('{Home}{ArrowDown}');
  await waitFor(() => expect(quantity).toHaveValue('0'));
  expect(decrement).toBeDisabled();
  await userEvent.clear(quantity);
  await waitFor(() => expect(quantity).toHaveValue(''));
  await userEvent.type(quantity, '2');
  await waitFor(() => expect(quantity).toHaveValue('2'));

  const disabledInput = canvas.getByRole('textbox', {
    name: 'Disabled number field',
  });
  expect(disabledInput).toBeDisabled();
  await userEvent.click(
    canvas.getByRole('button', {
      name: 'Increase disabled number field',
    }),
  );
  expect(disabledInput).toHaveValue('6');
  expect(
    canvas.getByRole('textbox', { name: 'Scrubbable quantity' }),
  ).toHaveValue('10');
  expect(errorHandler).not.toHaveBeenCalled();
};
