import { Meta, StoryObj } from '@storybook/react';
import { CatalogDecorator, CatalogStory, ComponentDecorator } from 'twenty-ui';

import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowRunStatusTag } from '../WorkflowRunStatusTag';

const meta: Meta<typeof WorkflowRunStatusTag> = {
  title: 'Modules/Workflow/WorkflowRunStatusTag',
  component: WorkflowRunStatusTag,
};

export default meta;
type Story = StoryObj<typeof WorkflowRunStatusTag>;

export const Default: Story = {
  args: {
    workflowRunStatus: 'RUNNING',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof WorkflowRunStatusTag> = {
  argTypes: {
    workflowRunStatus: { table: { disable: true } },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'version status',
          values: [
            'NOT_STARTED',
            'RUNNING',
            'COMPLETED',
            'FAILED',
          ] satisfies WorkflowRunStatus[],
          props: (workflowRunStatus: WorkflowRunStatus) => ({
            workflowRunStatus,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
