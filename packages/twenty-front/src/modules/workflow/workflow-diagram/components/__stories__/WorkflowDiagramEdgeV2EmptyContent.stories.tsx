import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { WorkflowDiagramEdgeV2EmptyContent } from '../WorkflowDiagramEdgeV2EmptyContent';

const meta: Meta<typeof WorkflowDiagramEdgeV2EmptyContent> = {
  title: 'Modules/Workflow/WorkflowDiagramEdgeV2EmptyContent',
  component: WorkflowDiagramEdgeV2EmptyContent,
  decorators: [
    ComponentDecorator,
    ReactflowDecorator,
    (Story) => {
      const workflowVisualizerComponentInstanceId =
        'workflow-visualizer-test-id';

      return (
        <WorkflowVisualizerComponentInstanceContext.Provider
          value={{
            instanceId: workflowVisualizerComponentInstanceId,
          }}
        >
          <Story />
        </WorkflowVisualizerComponentInstanceContext.Provider>
      );
    },
  ],
  args: {
    labelX: 0,
    labelY: 0,
    parentStepId: 'parent-step-id',
    nextStepId: 'next-step-id',
    onCreateFilter: fn(),
    onCreateNode: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEdgeV2EmptyContent>;

export const ButtonsAppearOnHover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const filterButton = buttons[0];

    userEvent.hover(filterButton);

    await waitFor(() => {
      expect(filterButton).toBeVisible();
    });
  },
};

export const CreateFilter: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const filterButton = buttons[0];

    userEvent.hover(filterButton);

    await waitFor(() => {
      expect(filterButton).toBeVisible();
    });

    userEvent.click(filterButton);

    await waitFor(() => {
      expect(args.onCreateFilter).toHaveBeenCalledTimes(1);
    });
  },
};

export const AddNodeAction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const addNodeButton = buttons[1];

    userEvent.hover(addNodeButton);

    userEvent.click(addNodeButton);

    await waitFor(() => {
      expect(args.onCreateNode).toHaveBeenCalledTimes(1);
    });
  },
};
