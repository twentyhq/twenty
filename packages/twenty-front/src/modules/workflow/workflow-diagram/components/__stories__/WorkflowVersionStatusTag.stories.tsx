import { Meta, StoryObj } from '@storybook/react';
import { CatalogDecorator, CatalogStory, ComponentDecorator } from 'twenty-ui';

import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowVersionStatusTag } from '../WorkflowVersionStatusTag';

const meta: Meta<typeof WorkflowVersionStatusTag> = {
  title: 'Modules/Workflow/WorkflowVersionStatusTag',
  component: WorkflowVersionStatusTag,
};

export default meta;
type Story = StoryObj<typeof WorkflowVersionStatusTag>;

export const Default: Story = {
  args: {
    versionStatus: 'DRAFT',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof WorkflowVersionStatusTag> = {
  argTypes: {
    versionStatus: { table: { disable: true } },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'version status',
          values: [
            'DRAFT',
            'ACTIVE',
            'DEACTIVATED',
            'ARCHIVED',
          ] satisfies WorkflowVersionStatus[],
          props: (versionStatus: WorkflowVersionStatus) => ({ versionStatus }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
