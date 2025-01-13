import { DateTime } from 'luxon';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';

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
    scopes: [BlocklistItemScope.CC],
    __typename: 'BlocklistItem',
  },
  {
    id: '4',
    handle: '@twenty.com',
    workspaceMemberId: '1',
    createdAt: DateTime.now().minus({ days: 4 }).toISO() ?? '',
    scopes: [
      BlocklistItemScope.BCC,
      BlocklistItemScope.CC,
      BlocklistItemScope.FROM_TO,
    ],
    __typename: 'BlocklistItem',
  },
];
