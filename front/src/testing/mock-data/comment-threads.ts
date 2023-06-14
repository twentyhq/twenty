import { CommentableType, CommentThread } from '~/generated/graphql';

export const mockedCommentThreads: Array<CommentThread> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
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
