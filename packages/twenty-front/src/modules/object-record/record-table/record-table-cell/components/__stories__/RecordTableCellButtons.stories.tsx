import { RecordTableCellButtons } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButtons';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { IconPencil, IconPlus } from 'twenty-ui/icon';

const meta: Meta<typeof RecordTableCellButtons> = {
  title: 'Modules/RecordTable/RecordTableCellButtons',
  component: RecordTableCellButtons,
  args: {
    buttons: [
      { Icon: IconPencil, ariaLabel: 'Edit field', onClick: fn() },
      { Icon: IconPlus, ariaLabel: 'Unavailable action' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof RecordTableCellButtons>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const edit = canvas.getByRole('button', { name: 'Edit field' });
    const unavailable = canvas.getByRole('button', {
      name: 'Unavailable action',
    });
    const group = canvas.getByRole('group', { name: 'Cell controls' });
    const frame = group.parentElement;
    if (!isDefined(frame)) {
      throw new Error('Missing table action frame');
    }
    await expect(getComputedStyle(edit).width).toBe('24px');
    await expect(getComputedStyle(group).gap).toBe('2px');
    await expect(parseFloat(getComputedStyle(edit).borderTopLeftRadius)).toBe(
      parseFloat(getComputedStyle(frame).borderTopLeftRadius) - 1,
    );
    await expect(unavailable).toBeDisabled();
    edit.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.buttons[0].onClick).toHaveBeenCalledOnce();
  },
};
