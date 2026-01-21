import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { WorkflowEditActionFilterBody } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilterBody';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION: WorkflowFilterAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Filter Records',
  type: 'FILTER',
  valid: false,
  settings: {
    input: {
      stepFilterGroups: [],
      stepFilters: [],
    },
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
};

const meta: Meta<typeof WorkflowEditActionFilterBody> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowEditActionFilterBody',
  component: WorkflowEditActionFilterBody,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: DEFAULT_ACTION,
    actionOptions: {
      readonly: false,
      onActionUpdate: fn(),
    },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    WorkflowStepFilterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditActionFilterBody>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    action: DEFAULT_ACTION,
    actionOptions: {
      readonly: true,
    },
  },
};
