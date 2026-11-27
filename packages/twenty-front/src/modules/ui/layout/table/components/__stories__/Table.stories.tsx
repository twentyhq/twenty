import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { TableSkeletonRows } from '@/ui/layout/table/components/TableSkeletonRows';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof Table> = {
  title: 'UI/Layout/Table/Table',
  component: Table,
  decorators: [ComponentDecorator],
  argTypes: {
    as: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableRow>
        <TableHeader>Header 1</TableHeader>
        <TableHeader>Header 2</TableHeader>
        <TableHeader align="right">Numbers</TableHeader>
      </TableRow>
      <TableSection title="Section 1">
        <TableRow>
          <TableCell>Cell 1</TableCell>
          <TableCell>Cell 2</TableCell>
          <TableCell align="right">3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Cell 4</TableCell>
          <TableCell>Cell 5</TableCell>
          <TableCell align="right">6</TableCell>
        </TableRow>
      </TableSection>
      <TableSection title="Section 2">
        <TableRow>
          <TableCell>Lorem ipsum dolor sit amet</TableCell>
          <TableCell>Lorem ipsum</TableCell>
          <TableCell align="right">42</TableCell>
        </TableRow>
      </TableSection>
    </Table>
  ),
};

const LOADING_GRID_TEMPLATE_COLUMNS = '110px 150px minmax(0, 1fr) 90px';

export const Loading: Story = {
  render: () => (
    <Table>
      <TableRow gridTemplateColumns={LOADING_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>Status</TableHeader>
        <TableHeader>Started</TableHeader>
        <TableHeader>Input</TableHeader>
        <TableHeader align="right">Tokens</TableHeader>
      </TableRow>
      <TableSkeletonRows
        gridTemplateColumns={LOADING_GRID_TEMPLATE_COLUMNS}
        columnCount={4}
      />
    </Table>
  ),
};
