import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import '@xyflow/react/dist/style.css';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { WorkflowDiagramEdgeV2 } from '../WorkflowDiagramEdgeV2';

const meta: Meta<typeof WorkflowDiagramEdgeV2> = {
  title: 'Modules/Workflow/WorkflowDiagramEdgeV2',
  component: WorkflowDiagramEdgeV2,
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
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEdgeV2>;

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const buttons = await canvas.findAllByRole('button');
    const filterButton = buttons[0];

    userEvent.hover(filterButton);

    await waitFor(() => {
      expect(filterButton).toBeVisible();
    });

    userEvent.click(filterButton);

    // TODO: Assert we created a filter
  },
};

export const AddNodeAction: Story = {
  play: async ({ canvasElement }) => {
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
