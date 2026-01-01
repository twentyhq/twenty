import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';

const STEP_FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group-1',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};

const TEXT_STEP_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: 'company.name',
  type: 'text',
  value: 'Acme',
  operand: ViewFilterOperand.CONTAINS,
};

const meta: Meta<typeof WorkflowStepFilterColumn> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterColumn',
  component: WorkflowStepFilterColumn,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilterGroup: STEP_FILTER_GROUP,
    stepFilter: TEXT_STEP_FILTER,
    stepFilterIndex: 0,
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
type Story = StoryObj<typeof WorkflowStepFilterColumn>;

export const Default: Story = {};
