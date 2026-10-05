import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';

const meta: Meta<typeof ObjectFilterDropdownRecordPinnedItems> = {
  title: 'Modules/ObjectRecord/ObjectFilterDropdownRecordPinnedItems',
  component: ObjectFilterDropdownRecordPinnedItems,
  decorators: [ComponentDecorator],
  args: {
    selectableItems: [
      { id: 'current-user', name: 'Current user', isSelected: false },
    ],
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ObjectFilterDropdownRecordPinnedItems>;

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('option', { name: 'Current user' });

    await expect(canvas.getByRole('listbox')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
    row.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(
      args.selectableItems[0],
      true,
    );
    await expect(row).toHaveFocus();
  },
};

export const IndicatorSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('option', { name: 'Current user' });
    const indicator = row.querySelector('span[aria-hidden="true"]');

    await expect(indicator).not.toBeNull();
    await userEvent.click(indicator as HTMLElement);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenCalledWith(
      args.selectableItems[0],
      true,
    );
    await expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};
