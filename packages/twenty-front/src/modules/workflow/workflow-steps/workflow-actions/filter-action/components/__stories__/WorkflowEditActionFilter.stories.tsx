import { WorkflowFilterAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionFilter } from '../WorkflowEditActionFilter';

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
          parentStepFilterGroupId: null,
          logicalOperator: 'AND',
          stepFilterGroupChildren: [],
        },
      ],
      stepFilters: [
        {
          id: 'filter-1',
          stepFilterGroupId: 'filter-group-1',
          stepOutputKey: 'company.name',
          displayValue: 'Company Name',
          operandType: 'LITERAL',
          operand: 'contains',
          value: 'Acme',
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
