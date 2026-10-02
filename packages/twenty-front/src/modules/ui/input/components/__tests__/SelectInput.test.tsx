import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { SelectInput } from '@/ui/input/components/SelectInput';

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'To do', value: 'TODO' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
];

const renderSelectInput = (value: string | null) => {
  const onOptionSelected = jest.fn();
  const onClear = jest.fn();

  render(
    <Dropdown.Root type="picker" open>
      <Dropdown.Content aria-label="Status">
        <SelectInput
          options={STATUS_OPTIONS}
          value={value}
          onOptionSelected={onOptionSelected}
          onClear={onClear}
          clearLabel="Status"
        />
      </Dropdown.Content>
    </Dropdown.Root>,
  );

  return { onOptionSelected, onClear };
};

describe('SelectInput', () => {
  it('lists matching options before the clear option while searching', async () => {
    const user = userEvent.setup();
    const { onOptionSelected, onClear } = renderSelectInput('TODO');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 's');

    const optionLabels = within(screen.getByRole('dialog', { name: 'Status' }))
      .getAllByRole('button')
      .map((option) => option.textContent);

    expect(optionLabels).toEqual(['In progress', 'No Status']);

    await user.keyboard('{Enter}');

    expect(onOptionSelected).toHaveBeenCalledWith(STATUS_OPTIONS[1]);
    expect(onClear).not.toHaveBeenCalled();
  });

  it('selects the clear option when the field has no value', () => {
    renderSelectInput(null);

    expect(screen.getByRole('button', { name: 'No Status' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('does not select the clear option when the value is not an available option', () => {
    renderSelectInput('ARCHIVED');

    expect(screen.getByRole('button', { name: 'No Status' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
