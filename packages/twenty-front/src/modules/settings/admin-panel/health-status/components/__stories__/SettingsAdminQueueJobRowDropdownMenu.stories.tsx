import { SettingsAdminQueueJobRowDropdownMenu } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueJobRowDropdownMenu';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { JobState } from '~/generated-admin/graphql';

const onRowClick = fn();

const meta: Meta<typeof SettingsAdminQueueJobRowDropdownMenu> = {
  title: 'Modules/Settings/AdminPanel/SettingsAdminQueueJobRowDropdownMenu',
  component: SettingsAdminQueueJobRowDropdownMenu,
  args: {
    jobId: 'failed-job',
    jobState: JobState.FAILED,
    onRetry: fn(),
    onDelete: fn(),
  },
  decorators: [
    ComponentDecorator,
    (Story) => (
      <TableRow onClick={onRowClick}>
        <Story />
      </TableRow>
    ),
  ],
  beforeEach: () => {
    onRowClick.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAdminQueueJobRowDropdownMenu>;

export const RetryWithoutExpandingRow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Job Actions' });
    await userEvent.click(trigger);
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Retry' }),
    );

    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(args.onDelete).not.toHaveBeenCalled();
    await expect(onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
