import { formatISO, parseISO, subDays, subHours } from 'date-fns';

import { type BlocklistItem } from '@/accounts/types/BlocklistItem';

export const mockedBlocklist: BlocklistItem[] = [
  {
    id: '1',
    handle: 'test1@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      formatISO(subHours(parseISO('2023-04-26T10:12:42.33625+00:00'), 2)) ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '2',
    handle: 'test2@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      formatISO(subDays(parseISO('2023-04-26T10:12:42.33625+00:00'), 2)) ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '3',
    handle: 'test3@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      formatISO(subDays(parseISO('2023-04-26T10:12:42.33625+00:00'), 3)) ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '4',
    handle: '@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      formatISO(subDays(parseISO('2023-04-26T10:12:42.33625+00:00'), 4)) ?? '',
    __typename: 'BlocklistItem',
  },
];
