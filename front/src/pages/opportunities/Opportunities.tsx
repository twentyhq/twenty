import { FaBullseye } from 'react-icons/fa';

import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { Board, Column, Items } from '../../modules/ui/components/board/Board';

export function Opportunities() {
  const items: Items = {
    'item-1': { id: 'item-1', content: 'Item 1' },
    'item-2': { id: 'item-2', content: 'Item 2' },
    'item-3': { id: 'item-3', content: 'Item 3' },
    'item-4': { id: 'item-4', content: 'Item 4' },
    'item-5': { id: 'item-5', content: 'Item 5' },
    'item-6': { id: 'item-6', content: 'Item 6' },
  };

  const initialBoard = [
    {
      id: 'column-1',
      title: 'Column 1',
      itemKeys: ['item-1', 'item-2', 'item-3', 'item-4'],
    },
    {
      id: 'column-2',
      title: 'Column 2',
      itemKeys: ['item-5', 'item-6'],
    },
  ] satisfies Column[];

  return (
    <WithTopBarContainer title="Opportunities" icon={<FaBullseye />}>
      <Board initialBoard={initialBoard} items={items} />
    </WithTopBarContainer>
  );
}
