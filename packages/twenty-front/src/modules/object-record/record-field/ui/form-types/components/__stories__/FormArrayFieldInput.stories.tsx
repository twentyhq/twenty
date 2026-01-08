import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';

const meta: Meta<typeof FormArrayFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormArrayFieldInput',
  component: FormArrayFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof FormArrayFieldInput>;

export const AddTwoItems: Story = {
  args: {
    label: 'Items',
    defaultValue: undefined,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const emptyInput = await canvas.findByPlaceholderText('Enter an item');

    await userEvent.type(emptyInput, 'First item{enter}');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(['First item']);
    });

    const firstItemChip = await canvas.findByText('First item');

    expect(firstItemChip).toBeVisible();

    await waitFor(() => {
      expect(emptyInput).not.toBeVisible();
    });

    const addItemButton = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Add item');

    await userEvent.click(addItemButton);

    await waitFor(() => {
      expect(addItemButton).not.toBeVisible();
    });

    const newItemInput = await within(
      getCanvasElementForDropdownTesting(),
    ).findByRole('textbox');

    await userEvent.type(newItemInput, 'Second item{enter}');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(['First item', 'Second item']);
    });

    await waitFor(() => {
      expect(newItemInput).not.toBeVisible();
    });

    const secondItemMenuItem = await waitFor(() => {
      const allSecondItems = within(
        getCanvasElementForDropdownTesting(),
      ).getAllByText('Second item');

      expect(allSecondItems).toHaveLength(2);

      return allSecondItems[1];
    });

    expect(secondItemMenuItem).toBeVisible();
  },
};

export const EditExistingItem: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item', 'Second item'],
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const firstItemChip = await canvas.findByText('First item');

    await userEvent.click(firstItemChip);

    const openSecondItemMenuButton = await waitFor(() => {
      const button = getCanvasElementForDropdownTesting().querySelector(
        '[aria-controls$="-1-options"] > button',
      );

      if (!isDefined(button)) {
        throw new Error('Button not found');
      }

      return button;
    });

    await userEvent.click(openSecondItemMenuButton);

    const editSecondItemButton = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Edit');

    await userEvent.click(editSecondItemButton);

    const editSecondItemInput = await within(
      getCanvasElementForDropdownTesting(),
    ).findByRole('textbox');

    expect(editSecondItemInput).toHaveValue('Second item');

    await userEvent.clear(editSecondItemInput);
    await userEvent.type(editSecondItemInput, 'Updated second item{enter}');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith([
        'First item',
        'Updated second item',
      ]);
    });

    const updatedSecondItemChip = await canvas.findByText(
      'Updated second item',
    );

    expect(updatedSecondItemChip).toBeVisible();
  },
};

export const DeleteExistingItem: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item', 'Second item'],
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const firstItemChip = await canvas.findByText('First item');

    await userEvent.click(firstItemChip);

    const openSecondItemMenuButton = await waitFor(() => {
      const button = getCanvasElementForDropdownTesting().querySelector(
        '[aria-controls$="-1-options"] > button',
      );

      if (!isDefined(button)) {
        throw new Error('Button not found');
      }

      return button;
    });

    await userEvent.click(openSecondItemMenuButton);

    const deleteSecondItemButton = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Delete');

    await userEvent.click(deleteSecondItemButton);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(['First item']);
    });

    expect(canvas.queryByText('Second item')).not.toBeInTheDocument();
  },
};

export const SetVariable: Story = {
  args: {
    label: 'Items',
    defaultValue: undefined,
    onChange: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.click(addVariableButton);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(`{{${MOCKED_STEP_ID}.name}}`);
    });

    const variable = await canvas.findByText('Name');

    expect(variable).toBeVisible();
  },
};

export const ReplaceItemsWithVariable: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item', 'Second item'],
    onChange: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.click(addVariableButton);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(`{{${MOCKED_STEP_ID}.name}}`);
    });

    const variable = await canvas.findByText('Name');

    expect(variable).toBeVisible();
  },
};

export const ReplaceVariableWithItems: Story = {
  args: {
    label: 'Items',
    defaultValue: `{{${MOCKED_STEP_ID}.createdAt}}`,
    onChange: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const deleteVariableButton = await canvas.findByRole('button', {
      name: 'Remove variable',
    });

    await userEvent.click(deleteVariableButton);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith([]);
    });

    const emptyInput = await canvas.findByPlaceholderText('Enter an item');

    await userEvent.type(emptyInput, 'First item{enter}');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(['First item']);
    });

    const firstItemChip = await canvas.findByText('First item');

    expect(firstItemChip).toBeVisible();
  },
};

export const DisabledEmptyField: Story = {
  args: {
    defaultValue: undefined,
    onChange: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.textContent).toBe('');
    });
  },
};

export const DisabledWithItems: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item', 'Second item'],
    onChange: fn(),
    readonly: true,
  },
  play: async ({ canvasElement, args }) => {
    for (const item of args.defaultValue as string[]) {
      const itemChip = await within(canvasElement).findByText(item);

      expect(itemChip).toBeVisible();
    }
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Items',
    defaultValue: `{{${MOCKED_STEP_ID}.createdAt}}`,
    onChange: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variableChip = await canvas.findByText('Creation date');
    expect(variableChip).toBeVisible();

    await userEvent.click(variableChip);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();
  },
};
