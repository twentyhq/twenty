import { DropResult } from '@hello-pangea/dnd';

import { BoardItemKey, getOptimisticlyUpdatedBoard } from '../Board';

describe('getOptimisticlyUpdatedBoard', () => {
  it('should return a new board with the updated cell', () => {
    const initialColumn1: BoardItemKey[] = ['item-1', 'item-2', 'item-3'];
    const initialColumn2: BoardItemKey[] = ['item-4', 'item-5'];

    const finalColumn1: BoardItemKey[] = ['item-2', 'item-3'];
    const finalColumn2: BoardItemKey[] = ['item-4', 'item-1', 'item-5'];

    const dropResult = {
      source: {
        droppableId: 'column-1',
        index: 0,
      },
      destination: {
        droppableId: 'column-2',
        index: 1,
      },
    } as DropResult;

    const initialBoard = [
      {
        id: 'column-1',
        title: 'My Column',
        itemKeys: initialColumn1,
      },
      {
        id: 'column-2',
        title: 'My Column',
        itemKeys: initialColumn2,
      },
    ];

    const updatedBoard = getOptimisticlyUpdatedBoard(initialBoard, dropResult);

    const finalBoard = [
      {
        id: 'column-1',
        title: 'My Column',
        itemKeys: finalColumn1,
      },
      {
        id: 'column-2',
        title: 'My Column',
        itemKeys: finalColumn2,
      },
    ];

    expect(updatedBoard).toEqual(finalBoard);
    expect(updatedBoard).not.toBe(initialBoard);
  });
});
