import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { Company } from '@/companies/types/Company';
import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

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
  author: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'>;
  assignee: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'>;
  comments: Comment[];
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
      person?: Pick<Person, 'id' | 'name' | 'avatarUrl'> | null;
      company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
    }
  >;
};

export const mockedTasks: Array<MockedActivity> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first task',
    type: 'Task',
    body: '',
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
    },
    assignee: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
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
    type: 'Note',
    body: '',
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
    },
    assignee: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
    },
    authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        personId: null,
        companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
        company: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
          name: 'Airbnb',
          domainName: 'airbnb.com',
        },
        person: null,
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
        person: null,
        activityId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
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
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Another note',
    body: '',
    type: 'Note',
    completedAt: null,
    dueAt: '2029-08-26T10:12:42.33625+00:00',
    author: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
    },
    assignee: {
      id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: '',
    },
    authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278t',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        personId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b', // Alexandre
        person: {
          id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
          name: {
            firstName: 'Alexandre',
            lastName: 'Test',
          },
          avatarUrl: '',
        },
        company: null,
        companyId: null,
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'ActivityTarget',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb279t',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d', // Jean d'Eau
        companyId: null,
        company: null,
        person: {
          id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
          name: {
            firstName: 'Jean',
            lastName: "d'Eau",
          },
          avatarUrl: '',
        },
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
        activity: {
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'ActivityTarget',
      },
    ],
    __typename: 'Activity',
  },
];
