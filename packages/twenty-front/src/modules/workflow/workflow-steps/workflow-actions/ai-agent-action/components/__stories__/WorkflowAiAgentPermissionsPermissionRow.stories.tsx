import { WorkflowAiAgentPermissionsFlagRow } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsFlagRow';
import { WorkflowAiAgentPermissionsPermissionRow } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsPermissionRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconSettings } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta = {
  title: 'Modules/Workflow/Actions/AiAgentPermissionRows',
  component: WorkflowAiAgentPermissionsPermissionRow,
  decorators: [ComponentDecorator],
  args: {
    permission: { key: 'canReadObjectRecords', label: 'Read records' },
    isEnabled: false,
    readonly: false,
    onAdd: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof WorkflowAiAgentPermissionsPermissionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionOwnership: Story = {
  render: (args) => (
    <>
      <WorkflowAiAgentPermissionsPermissionRow
        permission={args.permission}
        isEnabled={false}
        readonly={false}
        onAdd={args.onAdd}
      />
      <WorkflowAiAgentPermissionsFlagRow
        permission={{
          key: 'settings',
          name: 'Manage settings',
          description: 'Manage settings',
          Icon: IconSettings,
        }}
        isEnabled
        readonly={false}
        showDeleteButton
        onAdd={args.onAdd}
        onDelete={args.onDelete}
      />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const addButton = await canvas.findByRole('button', {
      name: 'Read records',
    });
    await userEvent.tab();
    await expect(addButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    const deleteButton = await canvas.findByRole('button', {
      name: 'Remove permission',
    });
    await expect(deleteButton).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
    await expect(
      canvas.queryByRole('button', { name: 'Manage settings' }),
    ).toBeNull();
  },
};

export const Readonly: Story = {
  args: { readonly: true, showDeleteButton: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Read records')).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.click(canvas.getByText('Read records'));
    await expect(args.onAdd).not.toHaveBeenCalled();
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};
