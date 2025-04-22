import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionFormBuilder } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormBuilder';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { userEvent } from '@storybook/testing-library';
import { FieldMetadataType } from 'twenty-shared/types';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const DEFAULT_ACTION = {
  id: getWorkflowNodeIdMock(),
  name: 'Form',
  type: 'FORM',
  valid: false,
  settings: {
    input: [
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc8',
        name: 'company',
        type: FieldMetadataType.TEXT,
        label: 'Company',
        placeholder: 'Select a company',
        settings: {},
      },
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc9',
        name: 'number',
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

const meta: Meta<typeof WorkflowEditActionFormBuilder> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionFormBuilder',
  component: WorkflowEditActionFormBuilder,
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

type Story = StoryObj<typeof WorkflowEditActionFormBuilder>;

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

    const titleText = await canvas.findByText('Form');

    expect(window.getComputedStyle(titleText).cursor).toBe('default');

    await userEvent.click(titleText);

    const titleInput = canvas.queryByDisplayValue('Form');
    expect(titleInput).not.toBeInTheDocument();

    await canvas.findByText('Company');

    const addFieldButton = canvas.queryByText('Add Field');
    expect(addFieldButton).not.toBeInTheDocument();
  },
};
