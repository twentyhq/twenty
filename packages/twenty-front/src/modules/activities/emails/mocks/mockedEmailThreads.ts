import { Scalars, TimelineThread } from '~/generated/graphql';

export type MockedThread = {
  id: string;
} & TimelineThread;

export const mockedEmailThreads: MockedThread[] = [
  {
    __typename: 'TimelineThread',
    id: 'ec7e12b9-4063-410f-ae9a-30e32452b9c0',
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
    id: 'ec7e12b9-4063-410f-ae9a-30e32452b9c0',
    body: 'This is a second test email' as Scalars['String'],
    numberOfMessagesInThread: 5 as Scalars['Float'],
    read: true as Scalars['Boolean'],
    receivedAt: new Date().toISOString() as Scalars['DateTime'],
    senderName: 'Coco Den' as Scalars['String'],
    senderPictureUrl: '' as Scalars['String'],
    subject: 'Test email number 2' as Scalars['String'],
  },
];
