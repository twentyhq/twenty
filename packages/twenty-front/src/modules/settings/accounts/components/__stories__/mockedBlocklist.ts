import { DateTime } from 'luxon';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';

export const mockedBlocklist: BlocklistItem[] = [
  {
    id: '1',
    handle: 'test1@twenty.com',
    workspaceMemberId: '1',
    createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '2',
    handle: 'test2@twenty.com',
    workspaceMemberId: '1',
    createdAt: DateTime.now().minus({ days: 2 }).toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '3',
    handle: 'test3@twenty.com',
    workspaceMemberId: '1',
    createdAt: DateTime.now().minus({ days: 3 }).toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '4',
    handle: '@twenty.com',
    workspaceMemberId: '1',
    createdAt: DateTime.now().minus({ days: 4 }).toISO() ?? '',
    __typename: 'BlocklistItem',
  },
];
