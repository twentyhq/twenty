import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { WorkflowDiagramStepNodeOptionsDropdown } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeOptionsDropdown';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledNode = styled.div`
  height: 48px;
  position: relative;
  width: 160px;
`;

const onNodeClick = fn();

const meta: Meta<typeof WorkflowDiagramStepNodeOptionsDropdown> = {
  title: 'Modules/Workflow/WorkflowDiagramStepNodeOptionsDropdown',
  component: WorkflowDiagramStepNodeOptionsDropdown,
  decorators: [
    (Story) => (
      <StyledNode onClick={onNodeClick}>
        <Story />
      </StyledNode>
    ),
    ComponentDecorator,
  ],
  args: {
    onChangeNode: fn(),
    onDuplicateNode: fn(),
    onDelete: fn(),
  },
  beforeEach: () => {
    onNodeClick.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DuplicateWithoutSelectingNode: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Node options' });

    const pointer = userEvent.setup();

    await pointer.pointer({ target: trigger, keys: '[MouseLeft>]' });
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await pointer.pointer({ target: trigger, keys: '[/MouseLeft]' });

    expect(await canvas.findByRole('menu')).toHaveAttribute(
      'data-click-outside-id',
      WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID,
    );
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Duplicate node' }),
    );

    expect(args.onDuplicateNode).toHaveBeenCalledTimes(1);
    expect(onNodeClick).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    });
  },
};

export const KeyboardWithoutDuplicate: Story = {
  args: { onDuplicateNode: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Node options' });

    await userEvent.click(trigger);
    const changeAction = await canvas.findByRole('menuitem', {
      name: 'Change node',
    });
    await waitFor(() => expect(changeAction).toHaveFocus());
    expect(
      canvas.queryByRole('menuitem', { name: 'Duplicate node' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(args.onDelete).toHaveBeenCalledTimes(1);
    expect(args.onChangeNode).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    });

    await userEvent.click(trigger);
    await canvas.findByRole('menu');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  },
};
