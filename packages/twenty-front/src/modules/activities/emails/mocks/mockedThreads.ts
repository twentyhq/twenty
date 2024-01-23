import { DateTime } from 'luxon';

import { Scalars, TimelineThread } from '~/generated/graphql';

export type MockedThread = {
  id: string;
} & TimelineThread;

export type MockedEmailUser = {
  avatarUrl: string;
  displayName: string;
  workspaceMemberId?: string;
  personId?: string;
};

export type MockedMessage = {
  id: string;
  from: MockedEmailUser;
  to: MockedEmailUser[];
  subject: string;
  body: string;
  sentAt: string;
};

export const mockedThreads: MockedThread[] = [
  {
    __typename: 'TimelineThread',
    id: '1',
    body: 'This is a test email' as Scalars['String'],
    numberOfMessagesInThread: 5 as Scalars['Float'],
    read: true as Scalars['Boolean'],
    receivedAt: new Date().toISOString() as Scalars['DateTime'],
    senderName: 'Thom Trp' as Scalars['String'],
    senderPictureUrl: '' as Scalars['String'],
    subject: 'Test email' as Scalars['String'],
  },
  {
    __typename: 'TimelineThread',
    id: '2',
    body: 'This is a second test email' as Scalars['String'],
    numberOfMessagesInThread: 5 as Scalars['Float'],
    read: true as Scalars['Boolean'],
    receivedAt: new Date().toISOString() as Scalars['DateTime'],
    senderName: 'Coco Den' as Scalars['String'],
    senderPictureUrl: '' as Scalars['String'],
    subject: 'Test email number 2' as Scalars['String'],
  },
];

export const mockedMessagesByThread: Map<string, MockedMessage[]> = new Map([
  [
    '1',
    Array.from({ length: 5 }).map((_, i) => ({
      id: `id${i + 1}`,
      from: {
        avatarUrl: '',
        displayName: `User ${i + 1}`,
        workspaceMemberId: `workspaceMemberId${i + 1}`,
        personId: `personId${i + 1}`,
      },
      to: [
        {
          avatarUrl: 'https://favicon.twenty.com/qonto.com',
          displayName: `User ${i + 2}`,
          workspaceMemberId: `workspaceMemberId${i + 1}`,
          personId: `personId${i + 2}`,
        },
      ],
      subject: `Subject ${i + 1}`,
      body: `Body ${
        i + 1
      }. I am testing a very long body. I am adding more text.
I also want to test a new line. To see if it works.

I am adding a new paragraph.

Thomas`,
      sentAt: DateTime.fromFormat('2021-03-12', 'yyyy-MM-dd').toISO() ?? '',
    })),
  ],
  [
    '2',
    Array.from({ length: 5 }).map((_, i) => ({
      id: `id${i + 10}`,
      from: {
        avatarUrl: '',
        displayName: `Other user ${i + 1}`,
        workspaceMemberId: `workspaceMemberId${i + 1}`,
        personId: `personId${i + 1}`,
      },
      to: [
        {
          avatarUrl: 'https://favicon.twenty.com/qonto.com',
          displayName: `Other user ${i + 2}`,
          workspaceMemberId: `workspaceMemberId${i + 1}`,
          personId: `personId${i + 2}`,
        },
      ],
      subject: `Subject ${i + 1}`,
      body: `Body ${
        i + 1
      }. Hello, I am testing a very long body. I am adding more text.

I am adding a new paragraph.

Thomas`,
      sentAt: DateTime.fromFormat('2021-03-12', 'yyyy-MM-dd').toISO() ?? '',
    })),
  ],
]);
