import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const STEP_FILTER_GROUP: StepFilterGroup = {
  id: 'filter-group-1',
  logicalOperator: StepLogicalOperator.AND,
  positionInStepFilterGroup: 0,
};

const TEXT_STEP_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: '{{company.name}}',
  type: 'text',
  value: 'Acme',
  operand: ViewFilterOperand.CONTAINS,
};

const BROKEN_FIELD_REFERENCE_STEP_FILTER: StepFilter = {
  ...TEXT_STEP_FILTER,
  stepOutputKey: 'company.name',
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
    MemoryRouterDecorator,
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    WorkflowStepFilterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowStepFilterColumn>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText(
        'Broken field reference. Select the field again to fix this condition.',
      ),
    ).toBeNull();
  },
};

export const WithBrokenFieldReference: Story = {
  args: {
    stepFilter: BROKEN_FIELD_REFERENCE_STEP_FILTER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(
        'Broken field reference. Select the field again to fix this condition.',
      ),
    ).toBeVisible();
  },
};
