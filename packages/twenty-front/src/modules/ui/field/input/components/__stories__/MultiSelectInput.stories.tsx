import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';
import {
  IconBolt,
  IconBrandGoogle,
  IconBrandLinkedin,
  IconCheck,
  IconHeart,
  IconRocket,
  IconTag,
  IconTarget,
} from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';

type RenderProps = {
  values: FieldMultiSelectValue;
  options: SelectOption[];
  onOptionSelected: (value: FieldMultiSelectValue) => void;
  onCancel?: () => void;
  dropdownWidth?: number;
};

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

const instanceId = getRecordFieldInputInstanceId({
  recordId: '123',
  fieldName: 'Relation',
  prefix: 'multi-select-story',
});

const Render = ({
  values,
  options,
  onOptionSelected,
  onCancel,
  dropdownWidth,
}: RenderProps) => {
  const [currentValues, setCurrentValues] =
    useState<FieldMultiSelectValue>(values);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId,
      },
    });
  }, [pushFocusItemToFocusStack]);

  const handleOptionSelected = (newValues: FieldMultiSelectValue) => {
    setCurrentValues(newValues);
    onOptionSelected(newValues);
  };

  return (
    <div style={{ height: '400px', padding: '20px' }}>
      <MultiSelectInput
        selectableListComponentInstanceId="multi-select-story"
        values={currentValues}
        options={options}
        focusId={instanceId}
        onCancel={onCancel}
        onOptionSelected={handleOptionSelected}
        dropdownWidth={dropdownWidth}
      />
    </div>
  );
};

const meta: Meta<typeof MultiSelectInput> = {
  title: 'UI/Field/Input/MultiSelectInput',
  component: MultiSelectInput,
  decorators: [ComponentDecorator, I18nFrontDecorator],
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
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole('textbox')).toBeVisible();
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
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole('textbox')).toBeVisible();
    });

    await waitFor(() => {
      const checkboxes = canvas.getAllByRole('checkbox', { checked: true });

      expect(checkboxes).toHaveLength(2);
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
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole('textbox')).toBeVisible();
    });

    await waitFor(() => {
      const checkboxes = canvas.getAllByRole('checkbox', { checked: true });

      expect(checkboxes).toHaveLength(1);
    });

    for (const option of sampleOptions) {
      expect(canvas.getByText(option.label)).toBeVisible();
    }

    await userEvent.click(canvas.getByText('Professional Network'));

    await waitFor(() => {
      const checkboxes = canvas.queryAllByRole('checkbox', { checked: true });

      expect(checkboxes).toHaveLength(0);
    });
  },
};

export const EmptyOptions: Story = {
  args: {
    values: [],
    options: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole('textbox')).toBeVisible();
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
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole('textbox')).toBeVisible();
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
    const canvas = within(canvasElement);

    const searchInput = canvas.getByRole('textbox');

    await userEvent.type(searchInput, 'marketing');

    await waitFor(() => {
      expect(canvas.getByText('Content Marketing')).toBeVisible();
      expect(canvas.getByText('Viral Marketing')).toBeVisible();
    });

    expect(canvas.queryByText('Social Media')).not.toBeInTheDocument();
    expect(canvas.getAllByRole('checkbox')).toHaveLength(2);
  },
};

export const NoResultsFound: Story = {
  args: {
    values: [],
    options: sampleOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const searchInput = canvas.getByRole('textbox');

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
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByRole('textbox');

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
