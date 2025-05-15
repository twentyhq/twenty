import { DateTime } from 'luxon';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';

export const mockedBlocklist: BlocklistItem[] = [
  {
    id: '1',
    handle: 'test1@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      DateTime.fromISO('2023-04-26T10:12:42.33625+00:00')
        .minus({ hours: 2 })
        .toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '2',
    handle: 'test2@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      DateTime.fromISO('2023-04-26T10:12:42.33625+00:00')
        .minus({ days: 2 })
        .toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '3',
    handle: 'test3@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      DateTime.fromISO('2023-04-26T10:12:42.33625+00:00')
        .minus({ days: 3 })
        .toISO() ?? '',
    __typename: 'BlocklistItem',
  },
  {
    id: '4',
    handle: '@twenty.com',
    workspaceMemberId: '1',
    createdAt:
      DateTime.fromISO('2023-04-26T10:12:42.33625+00:00')
        .minus({ days: 4 })
        .toISO() ?? '',
    __typename: 'BlocklistItem',
  },
];
