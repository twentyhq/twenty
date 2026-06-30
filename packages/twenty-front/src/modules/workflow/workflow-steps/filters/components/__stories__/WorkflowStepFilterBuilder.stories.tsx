import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const meta: Meta<typeof WorkflowStepFilterBuilder> = {
  title: 'Modules/Workflow/Filters/WorkflowStepFilterBuilder',
  component: WorkflowStepFilterBuilder,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    instanceId: getWorkflowNodeIdMock(),
    defaultValue: {
      stepFilterGroups: [],
      stepFilters: [],
    },
    readonly: false,
    onFilterSettingsUpdate: fn(),
  },
  decorators: [
    (Story) => (
      <WorkflowStepBody rowGap={themeCssVariables.spacing[0]}>
        <Story />
      </WorkflowStepBody>
    ),
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowStepFilterBuilder>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    readonly: true,
  },
};
