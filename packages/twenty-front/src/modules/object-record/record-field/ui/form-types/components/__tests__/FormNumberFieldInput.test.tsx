import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const NumberFieldWithParentState = ({
  initialValue,
}: {
  initialValue?: number;
}) => {
  const [value, setValue] = useState<number | string | undefined>(initialValue);

  return (
    <>
      <FormNumberFieldInput
        defaultValue={value}
        onChange={(newValue) => setValue(newValue ?? undefined)}
      />
      <button onClick={() => setValue(1)}>Reset to 1</button>
    </>
  );
};

it('keeps the decimal separator while a number is being typed', async () => {
  const user = userEvent.setup();
  render(<NumberFieldWithParentState />);
  const input = screen.getByPlaceholderText('Enter a number');

  await user.type(input, '1.5');

  expect(input).toHaveValue('1.5');
});

it('keeps the decimal separator when it replaces part of an existing number', async () => {
  const user = userEvent.setup();
  render(<NumberFieldWithParentState initialValue={15} />);
  const input = screen.getByDisplayValue('15');

  await user.type(input, '.', {
    initialSelectionStart: 1,
    initialSelectionEnd: 2,
  });

  expect(input).toHaveValue('1.');
});

it('shows the value set by the parent after the user typed', async () => {
  const user = userEvent.setup();
  render(<NumberFieldWithParentState initialValue={5} />);
  const input = screen.getByDisplayValue('5');
  await user.type(input, '2');
  expect(input).toHaveValue('52');

  await user.click(screen.getByRole('button', { name: 'Reset to 1' }));

  expect(input).toHaveValue('1');
});
