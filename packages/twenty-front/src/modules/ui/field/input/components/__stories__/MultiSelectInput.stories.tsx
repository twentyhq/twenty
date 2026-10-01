import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useRef, useState } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  IconBolt,
  IconBrandGoogle,
  IconBrandLinkedin,
  IconCheck,
  IconHeart,
  IconRocket,
  IconTag,
  IconTarget,
} from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const sampleOptions: SelectOption[] = [
  {
    value: 'social-media',
    label: 'Social Media',
    color: 'blue',
    Icon: IconTag,
  },
  {
    value: 'search-engine',
    label: 'Search Engine',
    color: 'green',
    Icon: IconBrandGoogle,
  },
  {
    value: 'professional',
    label: 'Professional Network',
    color: 'purple',
    Icon: IconBrandLinkedin,
  },
  { value: 'referral', label: 'Referral', color: 'orange', Icon: IconTag },
  {
    value: 'advertising',
    label: 'Advertising',
    color: 'red',
    Icon: IconTarget,
  },
  {
    value: 'content',
    label: 'Content Marketing',
    color: 'yellow',
    Icon: IconCheck,
  },
  { value: 'email', label: 'Email Campaign', color: 'pink', Icon: IconHeart },
  {
    value: 'viral',
    label: 'Viral Marketing',
    color: 'turquoise',
    Icon: IconBolt,
  },
  { value: 'growth', label: 'Growth Hacking', color: 'gray', Icon: IconRocket },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low Priority', color: 'green' },
  { value: 'medium', label: 'Medium Priority', color: 'yellow' },
  { value: 'high', label: 'High Priority', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const Render = ({
  values,
  options,
  onOptionSelected,
  onAddSelectOption,
}: ComponentProps<typeof MultiSelectInput>) => {
  const [currentValues, setCurrentValues] =
    useState<FieldMultiSelectValue>(values);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOptionSelected = (newValues: FieldMultiSelectValue) => {
    setCurrentValues(newValues);
    onOptionSelected(newValues);
  };

  return (
    <div style={{ height: '400px', padding: '20px' }}>
      <div ref={anchorRef} />
      <Dropdown.Root type="picker" multiple open>
        <DropdownContent anchor={anchorRef} aria-label="Options">
          <MultiSelectInput
            values={currentValues}
            options={options}
            onOptionSelected={handleOptionSelected}
            onAddSelectOption={onAddSelectOption}
          />
        </DropdownContent>
      </Dropdown.Root>
    </div>
  );
};

const meta: Meta<typeof MultiSelectInput> = {
  title: 'UI/Field/Input/MultiSelectInput',
  component: MultiSelectInput,
  decorators: [ComponentDecorator],
  args: {
    values: [],
    options: sampleOptions,
    onOptionSelected: fn(),
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof MultiSelectInput>;

export const Default: Story = {
  args: {
    values: [],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(canvas.getByRole('searchbox')).toBeVisible();
    });

    for (const option of sampleOptions) {
      expect(canvas.getByText(option.label)).toBeVisible();
    }
  },
};

export const WithPreselectedValues: Story = {
  args: {
    values: ['social-media', 'search-engine'],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(canvas.getByRole('searchbox')).toBeVisible();
    });

    await waitFor(() => {
      const selectedOptions = canvas.getAllByRole('button', { pressed: true });

      expect(selectedOptions).toHaveLength(2);
    });

    for (const option of sampleOptions) {
      expect(canvas.getByText(option.label)).toBeVisible();
    }
  },
};

export const SingleSelection: Story = {
  args: {
    values: ['professional'],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(canvas.getByRole('searchbox')).toBeVisible();
    });

    await waitFor(() => {
      const selectedOptions = canvas.getAllByRole('button', { pressed: true });

      expect(selectedOptions).toHaveLength(1);
    });

    for (const option of sampleOptions) {
      expect(canvas.getByText(option.label)).toBeVisible();
    }

    await userEvent.click(canvas.getByText('Professional Network'));

    await waitFor(() => {
      const selectedOptions = canvas.queryAllByRole('button', {
        pressed: true,
      });

      expect(selectedOptions).toHaveLength(0);
    });

    await userEvent.unhover(canvas.getByText('Professional Network'));

    await waitFor(() => {
      expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

export const EmptyOptions: Story = {
  args: {
    values: [],
    options: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(canvas.getByRole('searchbox')).toBeVisible();
    });

    expect(canvas.getByText('No option found')).toBeVisible();
  },
};

export const LongLabels: Story = {
  args: {
    values: ['long-option-1'],
    options: [
      {
        value: 'long-option-1',
        label:
          'This is a very long option label that might overflow the container',
        color: 'blue',
      },
      {
        value: 'long-option-2',
        label:
          'Another extremely long option label to test text wrapping behavior',
        color: 'green',
      },
      {
        value: 'short',
        label: 'Short',
        color: 'red',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(canvas.getByRole('searchbox')).toBeVisible();
    });

    expect(
      canvas.getByText(
        'This is a very long option label that might overflow the container',
      ),
    ).toBeVisible();
    expect(canvas.getByText('Short')).toBeVisible();
  },
};

export const SearchFiltering: Story = {
  args: {
    values: [],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const searchInput = canvas.getByRole('searchbox');

    await userEvent.type(searchInput, 'marketing');

    await waitFor(() => {
      expect(canvas.getByText('Content Marketing')).toBeVisible();
      expect(canvas.getByText('Viral Marketing')).toBeVisible();
    });

    expect(canvas.queryByText('Social Media')).not.toBeInTheDocument();
    expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

export const NoResultsFound: Story = {
  args: {
    values: [],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const searchInput = canvas.getByRole('searchbox');

    await userEvent.type(searchInput, 'xyz123');

    await waitFor(() => {
      expect(canvas.getByText('No option found')).toBeVisible();
    });
  },
};

export const KeyboardNavigation: Story = {
  args: {
    values: [],
    options: priorityOptions,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const searchInput = await canvas.findByRole('searchbox');

    await userEvent.click(searchInput);

    await waitFor(() => {
      expect(searchInput).toHaveFocus();
    });

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    const secondOption = await canvas.findByText('Medium Priority');
    expect(secondOption).toBeVisible();

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onOptionSelected).toHaveBeenCalledWith(['medium']);
    });
  },
};

export const SearchThenEnter: Story = {
  args: {
    values: [],
    options: priorityOptions,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const searchInput = await canvas.findByRole('searchbox');

    await userEvent.type(searchInput, 'high{Enter}');

    await waitFor(() => {
      expect(args.onOptionSelected).toHaveBeenCalledWith(['high']);
    });
    expect(canvas.getByRole('dialog', { name: 'Options' })).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'High Priority' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const AddOption: Story = {
  args: {
    values: [],
    options: priorityOptions,
    onAddSelectOption: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const searchInput = await canvas.findByRole('searchbox');

    await userEvent.type(searchInput, 'New priority{Enter}');
    expect(args.onAddSelectOption).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add "New priority" to options' }),
    );
    expect(args.onAddSelectOption).toHaveBeenCalledWith('New priority');
  },
};
