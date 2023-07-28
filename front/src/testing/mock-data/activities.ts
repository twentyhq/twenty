import {
  Activity,
  ActivityTarget,
  ActivityType,
  Comment,
  CommentableType,
} from '~/generated/graphql';

type MockedActivity = Pick<
  Activity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | '__typename'
  | 'type'
  | 'body'
  | 'title'
  | 'authorId'
> & {
  author: {
    __typename?: 'User' | undefined;
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  comments: Array<Pick<Comment, 'body'>>;
  activityTargets: Array<
    Pick<
      ActivityTarget,
      | 'id'
      | '__typename'
      | 'createdAt'
      | 'updatedAt'
      | 'activityId'
      | 'commentableId'
      | 'commentableType'
    > & { activity: Pick<Activity, 'id' | 'createdAt' | 'updatedAt'> }
  >;
};

export const mockedActivities: Array<MockedActivity> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first note',
    type: ActivityType.Note,
    body: null,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        commentableType: CommentableType.Company,
        commentableId: '89bb825c-171e-4bcc-9cf7-43448d6fb278', // airbnb
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'ActivityTarget',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb301',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentableType: CommentableType.Company,
        commentableId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae', // aircall
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb231',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb231',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'ActivityTarget',
      },
    ],
    __typename: 'Activity',
  },
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Another note',
    body: null,
    type: ActivityType.Note,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        commentableType: CommentableType.Person,
        commentableId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b', // Alexandre
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'ActivityTarget',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentableType: CommentableType.Person,
        commentableId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d', // Jean d'Eau
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'ActivityTarget',
      },
    ],
    __typename: 'Activity',
  },
];
