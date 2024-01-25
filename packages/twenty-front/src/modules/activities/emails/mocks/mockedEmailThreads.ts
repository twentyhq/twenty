import { Scalars, TimelineThread } from '~/generated/graphql';

export type MockedThread = {
  id: string;
} & TimelineThread;

export const mockedEmailThreads: MockedThread[] = [
  {
    __typename: 'TimelineThread',
    id: '4e88ec1f-a386-4235-bd82-98f25f6d557e',
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
    id: '4e88ec1f-a386-4235-bd82-98f25f6d557e',
    body: 'This is a second test email' as Scalars['String'],
    numberOfMessagesInThread: 5 as Scalars['Float'],
    read: true as Scalars['Boolean'],
    receivedAt: new Date().toISOString() as Scalars['DateTime'],
    senderName: 'Coco Den' as Scalars['String'],
    senderPictureUrl: '' as Scalars['String'],
    subject: 'Test email number 2' as Scalars['String'],
  },
];
