import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordBoardDecorator } from '~/testing/decorators/RecordBoardDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

// The kanban board is wider than this so its header must overflow horizontally.
const VIEWPORT_WIDTH = 420;

const meta: Meta<typeof RecordBoardHeader> = {
  title: 'Modules/ObjectRecord/RecordBoard/RecordBoardHeaderColumnOverflow',
  component: RecordBoardHeader,
  decorators: [
    MemoryRouterDecorator,
    SnackBarDecorator,
    RecordBoardDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: {
    recordBoardObjectNameSingular: 'task',
    recordBoardViewName: 'By Status',
    msw: graphqlMocks,
  },
  render: () => (
    <div style={{ width: VIEWPORT_WIDTH, overflow: 'hidden' }}>
      <RecordBoardHeader />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof RecordBoardHeader>;

export const KeepsColumnWidthWhenOverflowing: Story = {
  play: async ({ canvasElement }) => {
    const getColumnCells = () => {
      const header = canvasElement.querySelector('#record-board-header');
      if (!header) return [];
      // The sortable column wrappers are the flex children of the header row.
      return Array.from(header.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          getComputedStyle(child).display === 'flex',
      );
    };

    await waitFor(
      () => {
        expect(getColumnCells().length).toBeGreaterThan(1);
      },
      { timeout: 10000 },
    );

    const header = canvasElement.querySelector('#record-board-header');
    expect(header).not.toBeNull();

    // The header must overflow its viewport rather than squeezing columns to fit.
    expect((header as HTMLElement).scrollWidth).toBeGreaterThan(
      (header as HTMLElement).clientWidth,
    );

    // Every column keeps its fixed width (the regression shrank them to fit).
    for (const cell of getColumnCells()) {
      expect(cell.getBoundingClientRect().width).toBeGreaterThanOrEqual(
        RECORD_BOARD_COLUMN_WIDTH - 1,
      );
    }
  },
};
