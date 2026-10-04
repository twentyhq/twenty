import { SidePanelWorkflowRunStepContentComponentInstanceContext } from '@/side-panel/pages/workflow/step/view-run/states/contexts/SidePanelWorkflowRunStepContentComponentInstanceContext';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionFormFiller } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFiller';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { oneSucceededWorkflowRunQueryResult } from '~/testing/mock-data/workflow-run';

const meta: Meta<typeof WorkflowEditActionFormFiller> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionFormFiller',
  component: WorkflowEditActionFormFiller,
  parameters: {
    msw: graphqlMocks,
  },
  decorators: [
    (Story) => (
      <SidePanelWorkflowRunStepContentComponentInstanceContext.Provider
        value={{ instanceId: 'workflow-run-step-content' }}
      >
        <Story />
      </SidePanelWorkflowRunStepContentComponentInstanceContext.Provider>
    ),
    WorkflowStepActionDrawerDecorator,
    ComponentDecorator,
    WorkflowStepDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    WorkspaceDecorator,
    ToastDecorator,
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
      retryOnFailure: { value: 0 },
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

    const submitButton = canvas.queryByText('Submit');
    expect(submitButton).not.toBeInTheDocument();
  },
};

const actionWithInstructions: WorkflowFormAction = {
  ...mockAction,
  id: '6d9ac9a1-b5f9-4f63-9ab6-3d4b2f0f2a71',
  settings: {
    ...mockAction.settings,
    input: mockAction.settings.input.slice(0, 2),
    instructions:
      'Review the deal with {{trigger.properties.after.name}} before the renewal call.\nSet the discount you agreed on, in percent.',
  },
};

const pendingRunWithCompany = {
  workflowRun: {
    ...oneSucceededWorkflowRunQueryResult.workflowRun,
    status: 'RUNNING',
    endedAt: null,
    state: {
      ...oneSucceededWorkflowRunQueryResult.workflowRun.state,
      flow: {
        ...oneSucceededWorkflowRunQueryResult.workflowRun.state.flow,
        steps: [actionWithInstructions],
      },
      stepInfos: {
        trigger: {
          status: 'SUCCESS',
          result: { properties: { after: { name: 'Airbnb' } } },
        },
        [actionWithInstructions.id]: { status: 'PENDING' },
      },
    },
  },
};

export const WithInstructions: Story = {
  args: {
    action: actionWithInstructions,
    actionOptions: {
      readonly: false,
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneWorkflowRun', () =>
          HttpResponse.json({ data: pendingRunWithCompany }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        /Review the deal with Airbnb before the renewal call/,
      ),
    ).toBeVisible();
  },
};
