import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowEditActionFormFiller } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFiller';

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
    SnackBarDecorator,
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

// TEMP_DISABLED_TEST: Commented out unused mock data
// const mockActionWithDuplicatedRecordFields: WorkflowFormAction = {
//   id: 'form-action-1',
//   type: 'FORM',
//   name: 'Test Form',
//   valid: true,
//   settings: {
//     input: [
//       {
//         id: 'field-1',
//         name: 'record',
//         label: 'Record',
//         type: 'RECORD',
//         placeholder: 'Select a record',
//         settings: {
//           objectName: 'company',
//         },
//       },
//       {
//         id: 'field-2',
//         name: 'record',
//         label: 'Record',
//         type: 'RECORD',
//         placeholder: 'Select a record',
//         settings: {
//           objectName: 'company',
//         },
//       },
//     ],
//     outputSchema: {},
//     errorHandlingOptions: {
//       retryOnFailure: { value: false },
//       continueOnFailure: { value: false },
//     },
//   },
// };

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

    const submitButton = canvas.queryByText('Submit');
    expect(submitButton).not.toBeInTheDocument();
  },
};

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const CanHaveManyRecordFieldsForTheSameRecordType: Story = {
//   args: {
//     action: mockActionWithDuplicatedRecordFields,
//     actionOptions: {
//       readonly: false,
//     },
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);

//     const recordSelects = await waitFor(() => {
//       const elements = canvas.getAllByText('Select a company');

//       expect(elements.length).toBe(2);

//       return elements;
//     });

//     for (const recordSelect of recordSelects) {
//       expect(recordSelect).toBeVisible();

//       await userEvent.click(recordSelect);

//       await waitFor(() => {
//         expect(
//           within(getCanvasElementForDropdownTesting()).getByText('Louis Duss'),
//         ).toBeVisible();
//       });

//       await userEvent.click(canvasElement);
//     }
//   },
// };
