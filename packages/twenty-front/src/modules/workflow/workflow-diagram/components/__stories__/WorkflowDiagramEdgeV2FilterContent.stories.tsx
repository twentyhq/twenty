import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { WorkflowDiagramEdgeV2FilterContent } from '../WorkflowDiagramEdgeV2FilterContent';

const meta: Meta<typeof WorkflowDiagramEdgeV2FilterContent> = {
  title: 'Modules/Workflow/WorkflowDiagramEdgeV2FilterContent',
  component: WorkflowDiagramEdgeV2FilterContent,
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
    onDeleteFilter: fn(),
    onCreateNode: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEdgeV2FilterContent>;

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

export const AddNodeAction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const dotsButton = buttons[1];

    userEvent.hover(dotsButton);

    await waitFor(() => {
      expect(dotsButton).toBeVisible();
    });

    userEvent.click(dotsButton);

    const addNodeButton = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Add Node');

    userEvent.click(addNodeButton);

    await waitFor(() => {
      expect(canvas.queryByText('Add Node')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(args.onCreateNode).toHaveBeenCalledTimes(1);
    });
  },
};

export const DropdownInteractions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const dotsButton = buttons[1];

    userEvent.hover(dotsButton);

    await waitFor(() => {
      expect(dotsButton).toBeVisible();
    });

    userEvent.click(dotsButton);

    const dropdownCanvas = within(getCanvasElementForDropdownTesting());

    await waitFor(() => {
      expect(dropdownCanvas.getByText('Filter')).toBeVisible();
    });

    userEvent.click(canvasElement);

    await waitFor(() => {
      expect(dropdownCanvas.queryByText('Filter')).not.toBeInTheDocument();
    });

    userEvent.click(dotsButton);

    await waitFor(() => {
      expect(dropdownCanvas.getByText('Filter')).toBeVisible();
    });
  },
};
