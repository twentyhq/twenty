import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionForm } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionForm';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { FieldMetadataType } from 'twenty-shared';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION = {
  id: getWorkflowNodeIdMock(),
  name: 'Form',
  type: 'FORM',
  valid: false,
  settings: {
    input: [
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc8',
        type: FieldMetadataType.TEXT,
        label: 'Company',
        placeholder: 'Select a company',
        settings: {},
      },
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc9',
        type: FieldMetadataType.NUMBER,
        label: 'Number',
        placeholder: '1000',
        settings: {},
      },
    ],
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
} satisfies WorkflowFormAction;

const meta: Meta<typeof WorkflowEditActionForm> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionForm',
  component: WorkflowEditActionForm,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: DEFAULT_ACTION,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    ComponentDecorator,
    RouterDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionForm>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Company');
    await canvas.findByText('Add Field');
  },
};

export const DisabledWithEmptyValues: Story = {
  args: {
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = await canvas.findByDisplayValue('Form');

    expect(titleInput).toBeDisabled();

    await canvas.findByText('Company');

    const addFieldButton = canvas.queryByText('Add Field');
    expect(addFieldButton).not.toBeInTheDocument();
  },
};
