import { Meta, StoryObj } from '@storybook/react';

import { Table } from '../Table';
import { TableCell } from '../TableCell';
import { TableHeader } from '../TableHeader';
import { TableRow } from '../TableRow';
import { TableSection } from '../TableSection';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof Table> = {
  title: 'UI/Layout/Table/Table',
  component: Table,
  decorators: [ComponentDecorator],
  argTypes: {
    as: { table: { disable: true } },
    theme: { table: { disable: true } },
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
