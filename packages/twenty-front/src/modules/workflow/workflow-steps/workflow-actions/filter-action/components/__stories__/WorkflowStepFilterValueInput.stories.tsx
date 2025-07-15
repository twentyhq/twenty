import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { StepFilter, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowStepFilterValueInput } from '../WorkflowStepFilterValueInput';

const TEXT_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: 'company.name',
  displayValue: 'Company Name',
  type: 'text',
  label: 'Company Name',
  operand: ViewFilterOperand.Contains,
  value: 'Acme',
  positionInStepFilterGroup: 0,
};

const NUMBER_FILTER: StepFilter = {
  id: 'filter-2',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: 'company.employees',
  displayValue: 'Employee Count',
  type: 'number',
  label: 'Employee Count',
  operand: ViewFilterOperand.GreaterThanOrEqual,
  value: '100',
  positionInStepFilterGroup: 0,
};

const meta: Meta<typeof WorkflowStepFilterValueInput> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterValueInput',
  component: WorkflowStepFilterValueInput,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    stepFilter: TEXT_FILTER,
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
type Story = StoryObj<typeof WorkflowStepFilterValueInput>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Acme')).toBeVisible();
  },
};

export const NumberInput: Story = {
  args: {
    stepFilter: NUMBER_FILTER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('100')).toBeVisible();
  },
};
