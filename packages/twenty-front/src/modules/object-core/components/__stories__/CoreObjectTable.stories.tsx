import { type Meta, type StoryObj } from '@storybook/react-vite';
import { msg } from '@lingui/core/macro';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';

type Item = { id: string; name: string };

const items: Item[] = [
  { id: 'item-1', name: 'Alpha' },
  { id: 'item-2', name: 'Beta' },
];

const columns: CoreObjectTableColumn<Item>[] = [
  {
    fieldName: 'name',
    fieldLabel: msg`Name`,
    fieldType: 'string',
    align: 'left',
    gridTrack: '1fr',
    renderCell: (item) => item.name,
  },
];

const onToggleAllRows = fn();

const meta: Meta<typeof CoreObjectTable> = {
  title: 'Modules/ObjectCore/CoreObjectTable',
  component: CoreObjectTable,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof CoreObjectTable>;

export const ClearsSelectionOnSort: Story = {
  render: () => (
    <CoreObjectTable
      tableId="core-object-table-story"
      columns={columns}
      items={items}
      getItemKey={(item) => item.id}
      selection={{
        selectedRowIds: ['item-2'],
        onToggleRow: fn(),
        onToggleAllRows,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Name'));

    await expect(onToggleAllRows).toHaveBeenCalledTimes(1);
    await expect(onToggleAllRows).toHaveBeenCalledWith([]);
  },
};
