import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterOperandSelect';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { StepFilter, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const DEFAULT_STEP_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: 'company.name',
  displayValue: 'Company Name',
  type: 'text',
  label: 'Company Name',
  operand: ViewFilterOperand.Contains,
  value: '',
  positionInStepFilterGroup: 0,
};

const GREATER_THAN_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: 'company.employees',
  displayValue: 'Employee Count',
  type: 'number',
  label: 'Employee Count',
  operand: ViewFilterOperand.GreaterThanOrEqual,
  value: '100',
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterOperandSelect> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterOperandSelect',
  component: WorkflowStepFilterOperandSelect,
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
type Story = StoryObj<typeof WorkflowStepFilterOperandSelect>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Contains')).toBeVisible();
  },
};

export const WithGreaterThanOperand: Story = {
  args: {
    stepFilter: GREATER_THAN_FILTER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Greater than or equal'),
    ).toBeVisible();
  },
};
