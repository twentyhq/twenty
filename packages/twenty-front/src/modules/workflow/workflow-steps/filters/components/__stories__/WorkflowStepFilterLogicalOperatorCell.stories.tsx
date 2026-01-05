import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { type StepFilterGroup, StepLogicalOperator } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';

const AND_STEP_FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group-1',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};

const OR_STEP_FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group-2',
  logicalOperator: StepLogicalOperator.OR,
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterLogicalOperatorCell> = {
  title:
    'Modules/Workflow/Actions/Filter/WorkflowStepFilterLogicalOperatorCell',
  component: WorkflowStepFilterLogicalOperatorCell,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilterGroup: AND_STEP_FILTER_GROUP,
    index: 1,
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
type Story = StoryObj<typeof WorkflowStepFilterLogicalOperatorCell>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('And')).toBeVisible();
  },
};

export const OrOperator: Story = {
  args: {
    stepFilterGroup: OR_STEP_FILTER_GROUP,
    index: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Or')).toBeVisible();
  },
};
