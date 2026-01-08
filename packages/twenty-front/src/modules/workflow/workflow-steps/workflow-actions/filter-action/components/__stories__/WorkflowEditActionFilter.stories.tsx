import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { type Meta, type StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionFilter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';

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

const CONFIGURED_ACTION: WorkflowFilterAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Filter Companies',
  type: 'FILTER',
  valid: true,
  settings: {
    input: {
      stepFilterGroups: [
        {
          id: 'filter-group-1',
          logicalOperator: StepLogicalOperator.AND,
        },
      ],
      stepFilters: [
        {
          id: 'filter-1',
          stepFilterGroupId: 'filter-group-1',
          stepOutputKey: 'company.name',
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme',
          type: 'string',
        },
      ],
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

const meta: Meta<typeof WorkflowEditActionFilter> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowEditActionFilter',
  component: WorkflowEditActionFilter,
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
    I18nFrontDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditActionFilter>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    action: CONFIGURED_ACTION,
    actionOptions: {
      readonly: true,
    },
  },
};
