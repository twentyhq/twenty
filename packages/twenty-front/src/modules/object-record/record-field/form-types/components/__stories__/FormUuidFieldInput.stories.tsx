import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import {
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { FormUuidFieldInput } from '../FormUuidFieldInput';

const meta: Meta<typeof FormUuidFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormUuidFieldInput',
  component: FormUuidFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormUuidFieldInput>;

export const Default: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('UUID field');
  },
};

export const SetUuidWithDashes: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a-9047-467e-a313-700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(uuid);
    });
  },
};

export const SetUuidWithoutDashes: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a9047467ea313700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(uuid);
    });
  },
};

export const SetInvalidUuidWithNoValidation: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'invalid';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(uuid);
    });
  },
};

export const TrimInputBeforePersisting: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a9047467ea313700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, `{Space>2}${uuid}{Space>3}`);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(uuid);
    });
  },
};

export const ClearField: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    const uuid = 'test';

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(uuid);
    });

    await Promise.all([
      userEvent.clear(input),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(null);
      }),
    ]);
  },
};

export const ReplaceStaticValueWithVariable: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onPersist: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect('{{test}}');
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('Enter UUID');

    expect(input).toBeVisible();
    expect(input).toHaveDisplayValue('');

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    const [, , variableTag] = await Promise.all([
      userEvent.click(addVariableButton),

      waitForElementToBeRemoved(input),
      waitFor(() => {
        const variableTag = canvas.getByText('test');
        expect(variableTag).toBeVisible();

        return variableTag;
      }),
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith('{{test}}');
      }),
    ]);

    const removeVariableButton = canvasElement.querySelector(
      'button .tabler-icon-x',
    );

    await Promise.all([
      userEvent.click(removeVariableButton),

      waitForElementToBeRemoved(variableTag),
      waitFor(() => {
        const input = canvas.getByPlaceholderText('Enter UUID');
        expect(input).toBeVisible();
      }),
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(null);
      }),
    ]);
  },
};

export const Disabled: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    readonly: true,
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect('{{test}}');
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('Enter UUID');

    expect(input).toBeDisabled();

    const variablePicker = canvas.queryByText('Add variable');

    expect(variablePicker).not.toBeInTheDocument();
  },
};
