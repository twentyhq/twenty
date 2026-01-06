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
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';

const STEP_FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group-1',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterAddFilterRuleSelect> = {
  title:
    'Modules/Workflow/Actions/Filter/WorkflowStepFilterAddFilterRuleSelect',
  component: WorkflowStepFilterAddFilterRuleSelect,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilterGroup: STEP_FILTER_GROUP,
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
type Story = StoryObj<typeof WorkflowStepFilterAddFilterRuleSelect>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Add filter rule')).toBeVisible();
  },
};
