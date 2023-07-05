import { Column } from '@/ui/components/board/Board';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { CompanyProgressDict } from '../Board';

export const items: CompanyProgressDict = {
  'item-1': mockedCompaniesData[0],
  'item-2': mockedCompaniesData[1],
  'item-3': mockedCompaniesData[2],
  'item-4': mockedCompaniesData[3],
};

for (let i = 7; i <= 20; i++) {
  const key = `item-${i}`;
  items[key] = {
    ...mockedCompaniesData[i % mockedCompaniesData.length],
    id: key,
  };
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
