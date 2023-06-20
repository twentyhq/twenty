import { StrictMode } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Board } from '../Board';

import { initialBoard, items } from './mock-data';

const meta: Meta<typeof Board> = {
  title: 'UI/Board/Board',
  component: Board,
};

export default meta;
type Story = StoryObj<typeof Board>;

export const OneColumnBoard: Story = {
  render: () => (
    <StrictMode>
      <Board columns={initialBoard} initialBoard={initialBoard} items={items} />
    </StrictMode>
  ),
};
