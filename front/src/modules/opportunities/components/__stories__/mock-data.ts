import { Column, Items } from '../../../ui/components/board/Board';

export const items: Items = {
  'item-1': { id: 'item-1', content: 'Item 1' },
  'item-2': { id: 'item-2', content: 'Item 2' },
  'item-3': { id: 'item-3', content: 'Item 3' },
  'item-4': { id: 'item-4', content: 'Item 4' },
  'item-5': { id: 'item-5', content: 'Item 5' },
  'item-6': { id: 'item-6', content: 'Item 6' },
};
for (let i = 7; i <= 20; i++) {
  const key = `item-${i}`;
  items[key] = { id: key, content: `Item ${i}` };
}

export const initialBoard = [
  {
    id: 'column-1',
    title: 'New',
    colorCode: '#B76796',
    itemKeys: [
      'item-1',
      'item-2',
      'item-3',
      'item-4',
      'item-7',
      'item-8',
      'item-9',
    ],
  },
  {
    id: 'column-2',
    title: 'Screening',
    colorCode: '#CB912F',
    itemKeys: ['item-5', 'item-6'],
  },
  {
    id: 'column-3',
    colorCode: '#9065B0',
    title: 'Meeting',
    itemKeys: [],
  },
  {
    id: 'column-4',
    title: 'Proposal',
    colorCode: '#337EA9',
    itemKeys: [],
  },
  {
    id: 'column-5',
    colorCode: '#079039',
    title: 'Customer',
    itemKeys: [],
  },
] satisfies Column[];
