import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { StrictMode } from 'react';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormArrayFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormArrayFieldInput',
  component: FormArrayFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
};

export default meta;

type Story = StoryObj<typeof FormArrayFieldInput>;

export const AddTwoItems: Story = {
  decorators: [
    (Story) => (
      <StrictMode>
        <Story />
      </StrictMode>
    ),
  ],
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
      canvasElement.ownerDocument.body,
    ).findByText('Add item');

    await userEvent.click(addItemButton);

    await waitFor(() => {
      expect(addItemButton).not.toBeVisible();
    });

    const newItemInput = await within(
      canvasElement.ownerDocument.body,
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
        canvasElement.ownerDocument.body,
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

    const body = within(canvasElement.ownerDocument.body);
    const panel = await body.findByRole('dialog', { name: 'Items' });
    await userEvent.click(within(panel).getByText('Second item'));
    expect(body.queryByRole('menu')).not.toBeInTheDocument();
    const openSecondItemMenuButton = within(panel).getAllByRole('button', {
      name: 'More options',
    })[1];

    await userEvent.click(openSecondItemMenuButton);

    const editSecondItemButton = await body.findByRole('menuitem', {
      name: 'Edit',
    });

    await userEvent.click(editSecondItemButton);
    expect(panel).toBeVisible();

    const editSecondItemInput = await within(
      canvasElement.ownerDocument.body,
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

    const body = within(canvasElement.ownerDocument.body);
    const panel = await body.findByRole('dialog', { name: 'Items' });
    const openSecondItemMenuButton = within(panel).getAllByRole('button', {
      name: 'More options',
    })[1];

    await userEvent.click(openSecondItemMenuButton);

    const deleteSecondItemButton = await body.findByRole('menuitem', {
      name: 'Delete',
    });

    await userEvent.click(deleteSecondItemButton);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(['First item']);
    });

    expect(canvas.queryByText('Second item')).not.toBeInTheDocument();
    expect(panel).toBeVisible();
  },
};

export const ItemLimit: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item'],
    maxItemCount: 2,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Items' }));
    await userEvent.click(
      await body.findByRole('button', { name: 'Add item' }),
    );
    await userEvent.type(body.getByRole('textbox'), 'Second item{enter}');

    expect(args.onChange).toHaveBeenLastCalledWith([
      'First item',
      'Second item',
    ]);
    expect(
      body.queryByRole('button', { name: 'Add item' }),
    ).not.toBeInTheDocument();
  },
};

export const EscapeDismissesOneLayer: Story = {
  args: {
    label: 'Items',
    defaultValue: ['First item'],
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Items' }));

    const panel = await body.findByRole('dialog', { name: 'Items' });
    const menuTrigger = within(panel).getByRole('button', {
      name: 'More options',
    });
    await userEvent.click(menuTrigger);
    await userEvent.keyboard('{escape}');

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(panel).toBeVisible();
    await waitFor(() => expect(menuTrigger).toHaveFocus());

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Add item' }),
    );
    await userEvent.type(
      within(panel).getByRole('textbox'),
      'Uncommitted{escape}',
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(args.onChange).not.toHaveBeenCalled();
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
