import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Table } from '../Table';
import { TableCell } from '../TableCell';
import { TableHeader } from '../TableHeader';
import { TableSection } from '../TableSection';

const meta: Meta<typeof Table> = {
  title: 'UI/Table/Table',
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
      <thead>
        <tr>
          <TableHeader>Header 1</TableHeader>
          <TableHeader>Header 2</TableHeader>
          <TableHeader>Header 3</TableHeader>
        </tr>
      </thead>
      <TableSection title="Section 1">
        <tr>
          <TableCell>Cell 1</TableCell>
          <TableCell>Cell 2</TableCell>
          <TableCell>Cell 3</TableCell>
        </tr>
        <tr>
          <TableCell>Cell 4</TableCell>
          <TableCell>Cell 5</TableCell>
          <TableCell>Cell 6</TableCell>
        </tr>
      </TableSection>
      <TableSection title="Section 2">
        <tr>
          <TableCell>Lorem ipsum dolor sit amet</TableCell>
          <TableCell>Lorem ipsum</TableCell>
          <TableCell>Lorem ipsum</TableCell>
        </tr>
      </TableSection>
    </Table>
  ),
};
