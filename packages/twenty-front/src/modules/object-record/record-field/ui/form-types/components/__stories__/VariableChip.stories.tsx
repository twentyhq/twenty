import { VariableChip } from '@/object-record/record-field/ui/form-types/components/VariableChip';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof VariableChip> = {
  title: 'UI/Data/Field/Form/Input/VariableChip',
  component: VariableChip,
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof VariableChip>;

export const Default: Story = {
  args: {
    rawVariableName: `{{trigger.properties.after.address.addressStreet1}}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Address Street1')).toBeVisible();
  },
};

export const DefaultDeleteHovered: Story = {
  parameters: {
    pseudo: {
      hover: true,
    },
  },
  args: {
    rawVariableName: `{{trigger.properties.after.address.addressStreet1}}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Address Street1')).toBeVisible();
  },
};

export const WithVariableNotFound: Story = {
  args: {
    rawVariableName: `{{${MOCKED_STEP_ID}.unknown.variable}}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Not Found')).toBeVisible();
  },
};

export const WithVariableNotFoundDeleteHover: Story = {
  parameters: {
    pseudo: {
      hover: true,
    },
  },
  args: {
    rawVariableName: `{{${MOCKED_STEP_ID}.unknown.variable}}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Not Found')).toBeVisible();
  },
};
