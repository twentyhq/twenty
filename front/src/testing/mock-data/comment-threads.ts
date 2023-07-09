import {
  CommentableType,
  CommentThread,
  CommentThreadTarget,
} from '~/generated/graphql';

type MockedCommentThread = Pick<
  CommentThread,
  'id' | 'createdAt' | 'updatedAt' | '__typename' | 'body' | 'title'
> & {
  author: {
    __typename?: 'User' | undefined;
    id: string;
    firstName: string;
    lastName: string;
  };
  commentThreadTargets: Array<
    Pick<
      CommentThreadTarget,
      | 'id'
      | '__typename'
      | 'createdAt'
      | 'updatedAt'
      | 'commentableType'
      | 'commentableId'
      | 'commentThreadId'
    > & { commentThread: Pick<CommentThread, 'id' | 'createdAt' | 'updatedAt'> }
  >;
};

export const mockedCommentThreads: Array<MockedCommentThread> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first note',
    body: 'I will be writing great things here',
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
    },
    commentThreadTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        commentableType: CommentableType.Company,
        commentableId: '89bb825c-171e-4bcc-9cf7-43448d6fb278', // airbnb
        commentThreadId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
        commentThread: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'CommentThreadTarget',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb301',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentableType: CommentableType.Company,
        commentableId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae', // aircall
        commentThreadId: '89bb825c-171e-4bcc-9cf7-43448d6fb231',
        commentThread: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb231',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'CommentThreadTarget',
      },
    ],
    __typename: 'CommentThread',
  },
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Another note',
    body: 'I will  be more inspired tomorrow',
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
    },
    commentThreadTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        commentableType: CommentableType.Person,
        commentableId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b', // Alexandre
        commentThreadId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        commentThread: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'CommentThreadTarget',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentableType: CommentableType.Person,
        commentableId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d', // Jean d'Eau
        commentThreadId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        commentThread: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'CommentThreadTarget',
      },
    ],
    __typename: 'CommentThread',
  },
];
