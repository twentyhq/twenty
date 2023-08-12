import {
  Activity,
  ActivityTarget,
  ActivityType,
  Comment,
  Company,
  Person,
  User,
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
  | 'dueAt'
  | 'completedAt'
> & {
  author: {
    __typename?: 'User' | undefined;
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  assignee: {
    __typename?: 'User' | undefined;
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  comments: Array<
    Pick<Comment, 'body' | 'id' | 'createdAt' | 'updatedAt'> & {
      author: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
    }
  >;
  activityTargets: Array<
    Pick<
      ActivityTarget,
      | 'id'
      | '__typename'
      | 'createdAt'
      | 'updatedAt'
      | 'activityId'
      | 'personId'
      | 'companyId'
    > & {
      activity: Pick<Activity, 'id' | 'createdAt' | 'updatedAt'>;
      person?: Pick<Person, 'id' | 'displayName'>;
      company?: Pick<Company, 'id' | 'name' | 'domainName'>;
    }
  >;
};

export const mockedTasks: Array<MockedActivity> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first task',
    type: ActivityType.Task,
    body: null,
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    assignee: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
    comments: [],
    activityTargets: [],
    __typename: 'Activity',
  },
];

export const mockedActivities: Array<MockedActivity> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first note',
    type: ActivityType.Note,
    body: null,
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    assignee: {
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
        personId: null,
        companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        company: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          name: 'Airbnb',
          domainName: 'airbnb.com',
        },
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
        personId: null,
        companyId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
        company: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          name: 'Aircall',
          domainName: 'aircall.io',
        },
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
    completedAt: null,
    dueAt: '2029-08-26T10:12:42.33625+00:00',
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      firstName: 'Charles',
      lastName: 'Test',
      displayName: 'Charles Test',
    },
    assignee: {
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
        personId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b', // Alexandre
        person: {
          id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
          displayName: 'Alexandre Test',
        },
        companyId: null,
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
        personId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d', // Jean d'Eau
        companyId: null,
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
