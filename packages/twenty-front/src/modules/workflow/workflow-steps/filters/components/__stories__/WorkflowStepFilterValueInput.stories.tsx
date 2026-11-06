import { WorkflowStepFilterValueInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueInput';
import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const TEXT_FILTER: StepFilter = {
  id: 'filter-1',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: '{{company.name}}',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
  positionInStepFilterGroup: 0,
};

const NUMBER_FILTER: StepFilter = {
  id: 'filter-2',
  stepFilterGroupId: 'filter-group-1',
  stepOutputKey: '{{company.employees}}',
  operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
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
    filterType: 'text',
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
    filterType: 'number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue(100)).toBeVisible();
  },
};
