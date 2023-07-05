import { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Board } from '../Board';

import { initialBoard, items } from './mock-data';

const meta: Meta<typeof Board> = {
  title: 'UI/Board/Board',
  component: Board,
};

export default meta;
type Story = StoryObj<typeof Board>;

export const OneColumnBoard: Story = {
  render: getRenderWrapperForComponent(
    <Board
      pipelineId={'xxx-test'}
      columns={initialBoard}
      initialBoard={initialBoard}
      initialItems={items}
      onUpdateCard={async (_) => {}} // eslint-disable-line @typescript-eslint/no-empty-function
    />,
  ),
};
