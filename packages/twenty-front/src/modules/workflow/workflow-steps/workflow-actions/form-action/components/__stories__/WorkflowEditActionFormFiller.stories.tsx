import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowEditActionFormFiller } from '../WorkflowEditActionFormFiller';

const meta: Meta<typeof WorkflowEditActionFormFiller> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionFormFiller',
  component: WorkflowEditActionFormFiller,
  parameters: {
    msw: graphqlMocks,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    ComponentDecorator,
    I18nFrontDecorator,
    WorkflowStepDecorator,
    RouterDecorator,
    ObjectMetadataItemsDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditActionFormFiller>;

const mockAction: WorkflowFormAction = {
  id: 'form-action-1',
  type: 'FORM',
  name: 'Test Form',
  valid: true,
  settings: {
    input: [
      {
        id: 'field-1',
        name: 'text',
        label: 'Text Field',
        type: FieldMetadataType.TEXT,
        placeholder: 'Enter text',
        settings: {},
      },
      {
        id: 'field-2',
        name: 'number',
        label: 'Number Field',
        type: FieldMetadataType.NUMBER,
        placeholder: 'Enter number',
        settings: {},
      },
      {
        id: 'field-3',
        name: 'record',
        label: 'Record',
        type: 'RECORD',
        placeholder: 'Select a record',
        settings: {
          objectName: 'company',
        },
      },
      {
        id: 'field-4',
        name: 'date',
        label: 'Date',
        type: FieldMetadataType.DATE,
        placeholder: 'mm/dd/yyyy',
        settings: {},
      },
    ],
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
};

export const Default: Story = {
  args: {
    action: mockAction,
    actionOptions: {
      readonly: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textField = await canvas.findByText('Text Field');
    expect(textField).toBeVisible();

    const numberField = await canvas.findByText('Number Field');
    expect(numberField).toBeVisible();

    const recordField = await canvas.findByText('Record');
    expect(recordField).toBeVisible();

    const dateField = await canvas.findByText('Date');
    expect(dateField).toBeVisible();
  },
};

export const ReadonlyMode: Story = {
  args: {
    action: mockAction,
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textField = await canvas.findByText('Text Field');
    expect(textField).toBeVisible();

    const numberInput = await canvas.findByPlaceholderText('Enter number');
    expect(numberInput).toBeDisabled();

    const dateInput = await canvas.findByPlaceholderText('mm/dd/yyyy');
    expect(dateInput).toBeDisabled();

    const submitButton = await canvas.queryByText('Submit');
    expect(submitButton).not.toBeInTheDocument();
  },
};
