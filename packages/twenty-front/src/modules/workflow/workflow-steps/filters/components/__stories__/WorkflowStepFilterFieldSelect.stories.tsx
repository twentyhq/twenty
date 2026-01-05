import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react';
import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterFieldSelect';

const DEFAULT_STEP_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: '',
  type: 'text',
  operand: ViewFilterOperand.IS,
  value: '',
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterFieldSelect> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterFieldSelect',
  component: WorkflowStepFilterFieldSelect,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilter: DEFAULT_STEP_FILTER,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
    WorkflowStepFilterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowStepFilterFieldSelect>;

export const Default: Story = {};
