import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type Meta, type StoryObj } from '@storybook/react';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormUuidFieldInput } from '@/object-record/record-field/ui/form-types/components/FormUuidFieldInput';

const meta: Meta<typeof FormUuidFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormUuidFieldInput',
  component: FormUuidFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a-9047-467e-a313-700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(uuid);
    });
  },
};

export const SetUuidWithoutDashes: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a9047467ea313700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(uuid);
    });
  },
};

export const SetInvalidUuidWithNoValidation: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'invalid';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(uuid);
    });
  },
};

export const TrimInputBeforePersisting: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const uuid = 'fc50139a9047467ea313700fd75700ac';

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    await userEvent.type(input, `{Space>2}${uuid}{Space>3}`);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(uuid);
    });
  },
};

export const ClearField: Story = {
  args: {
    label: 'UUID field',
    placeholder: 'Enter UUID',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('Enter UUID');
    expect(input).toBeVisible();

    const uuid = 'test';

    await userEvent.type(input, uuid);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(uuid);
    });

    await Promise.all([
      userEvent.clear(input),

      waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(null);
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
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
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
