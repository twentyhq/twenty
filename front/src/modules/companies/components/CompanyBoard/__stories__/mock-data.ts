import { Column } from '@/ui/board/components/Board';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { CompanyProgressDict } from '../CompanyProgressBoard';

export const items: CompanyProgressDict = {
  'item-1': {
    company: mockedCompaniesData[0],
    pipelineProgress: { id: '0', amount: 1 },
  },
  'item-2': {
    company: mockedCompaniesData[1],
    pipelineProgress: { id: '1', amount: 1 },
  },
  'item-3': {
    company: mockedCompaniesData[2],
    pipelineProgress: { id: '2', amount: 1 },
  },
  'item-4': {
    company: mockedCompaniesData[3],
    pipelineProgress: { id: '3', amount: 1 },
  },
};

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
