import { WorkflowStepFilterDecorator } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/decorators/WorkflowStepFilterDecorator';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { WorkflowStepFilterAddRootStepFilterButton } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddRootStepFilterButton';

const meta: Meta<typeof WorkflowStepFilterAddRootStepFilterButton> = {
  title:
    'Modules/Workflow/Actions/Filter/WorkflowStepFilterAddRootStepFilterButton',
  component: WorkflowStepFilterAddRootStepFilterButton,
  parameters: {
    msw: graphqlMocks,
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
type Story = StoryObj<typeof WorkflowStepFilterAddRootStepFilterButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByRole('button');
    await expect(addButton).toBeVisible();
  },
};
