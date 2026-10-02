import { SelectInput } from '@/ui/input/components/SelectInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Dropdown } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'To do', value: 'TODO', color: 'blue' },
  { label: 'In progress', value: 'IN_PROGRESS', color: 'purple' },
  { label: 'Done', value: 'DONE', color: 'green' },
];

const SelectInputInDropdown = ({
  options,
  value,
  onOptionSelected,
  onClear,
  clearLabel,
}: ComponentProps<typeof SelectInput>) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ height: '300px', padding: '20px' }}>
      <div ref={anchorRef} />
      <Dropdown.Root type="picker" open>
        <DropdownContent anchor={anchorRef} aria-label="Status">
          <SelectInput
            options={options}
            value={value}
            onOptionSelected={onOptionSelected}
            onClear={onClear}
            clearLabel={clearLabel}
          />
        </DropdownContent>
      </Dropdown.Root>
    </div>
  );
};

const meta: Meta<typeof SelectInput> = {
  title: 'UI/Input/SelectInput',
  component: SelectInput,
  decorators: [ComponentDecorator],
  args: {
    options: STATUS_OPTIONS,
    value: 'TODO',
    clearLabel: 'Status',
    onOptionSelected: fn(),
    onClear: fn(),
  },
  render: SelectInputInDropdown,
};

export default meta;
type Story = StoryObj<typeof SelectInput>;

export const SearchListsMatchingOptionsBeforeClearOption: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });
    const picker = within(popup);

    await userEvent.type(
      picker.getByRole('searchbox', { name: 'Search' }),
      's',
    );

    expect(
      picker.getAllByRole('button').map((option) => option.textContent),
    ).toEqual(['In progress', 'No Status']);

    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(args.onOptionSelected).toHaveBeenCalledWith(STATUS_OPTIONS[1]),
    );
    expect(args.onClear).not.toHaveBeenCalled();
  },
};

export const EmptyValueSelectsClearOption: Story = {
  args: { value: null },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });

    expect(
      within(popup).getByRole('button', { name: 'No Status' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const UnavailableValueLeavesClearOptionUnselected: Story = {
  args: { value: 'ARCHIVED' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });

    expect(
      within(popup).getByRole('button', { name: 'No Status' }),
    ).toHaveAttribute('aria-pressed', 'false');
  },
};
