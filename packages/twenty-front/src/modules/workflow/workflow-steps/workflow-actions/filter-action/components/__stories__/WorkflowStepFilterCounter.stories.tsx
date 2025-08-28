import { WorkflowStepFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterCounter';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { THEME_LIGHT } from 'twenty-ui/theme';

const meta: Meta<typeof WorkflowStepFilterCounter> = {
  title: 'Modules/Workflow/Actions/Filter/WorkflowStepFilterCounter',
  component: WorkflowStepFilterCounter,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof WorkflowStepFilterCounter>;

export const Default: Story = {
  args: {
    counter: 1,
    backgroundColor: THEME_LIGHT.border.color.strong,
    textColor: THEME_LIGHT.font.color.inverted,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('1')).toBeVisible();
  },
};
