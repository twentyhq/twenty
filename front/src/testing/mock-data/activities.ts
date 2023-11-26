import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { Company } from '@/companies/types/Company';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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

export const mockedActivitiesMetadata: ObjectMetadataItem = {
  __typename: 'object',
  id: '20202020-8ee3-4f67-84ab-1b7a6eb5a448',
  nameSingular: 'activity',
  namePlural: 'activities',
  labelSingular: 'Activity',
  labelPlural: 'Activities',
  description: 'An activity',
  icon: 'IconCheckbox',
  isCustom: false,
  isActive: true,
  isSystem: true,
  createdAt: '2023-11-24T03:29:18.207Z',
  updatedAt: '2023-11-24T03:29:18.207Z',
  fields: [
    {
      __typename: 'field',
      id: '20202020-4694-4ec6-9084-8d932ebb3066',
      type: 'UUID',
      name: 'assigneeId',
      label: 'Assignee id (foreign key)',
      description: 'Acitivity assignee id foreign key',
      icon: null,
      isCustom: false,
      isActive: true,
      isSystem: true,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-88df-4202-bf82-6a06c6963280',
      type: 'DATE_TIME',
      name: 'updatedAt',
      label: 'Update date',
      description: null,
      icon: 'IconCalendar',
      isCustom: false,
      isActive: true,
      isSystem: true,
      isNullable: false,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-aff0-4961-be8a-0e5c2598b9a6',
      type: 'TEXT',
      name: 'body',
      label: 'Body',
      description: 'Activity body',
      icon: 'IconList',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-cd46-44f4-bf22-b0aa20d009da',
      type: 'DATE_TIME',
      name: 'reminderAt',
      label: 'Reminder Date',
      description: 'Activity reminder date',
      icon: 'IconCalendarEvent',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-2584-4797-95a8-5cc90d48c040',
      type: 'TEXT',
      name: 'title',
      label: 'Title',
      description: 'Activity title',
      icon: 'IconNotes',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-f695-419c-b928-c488323d6df3',
      type: 'UUID',
      name: 'id',
      label: 'Id',
      description: null,
      icon: null,
      isCustom: false,
      isActive: true,
      isSystem: true,
      isNullable: false,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-3acb-46bb-b993-0dc49fa2a48d',
      type: 'UUID',
      name: 'authorId',
      label: 'Author id (foreign key)',
      description: 'Activity author id foreign key',
      icon: null,
      isCustom: false,
      isActive: true,
      isSystem: true,
      isNullable: false,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-0924-48f0-a8c2-d2dd4e2098e2',
      type: 'DATE_TIME',
      name: 'completedAt',
      label: 'Completion Date',
      description: 'Activity completion date',
      icon: 'IconCheck',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-a243-4b94-a4b4-25705af86be2',
      type: 'TEXT',
      name: 'type',
      label: 'Type',
      description: 'Activity type',
      icon: 'IconCheckbox',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: false,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-65a2-4d9c-b640-bac54007a14d',
      type: 'DATE_TIME',
      name: 'createdAt',
      label: 'Creation date',
      description: null,
      icon: 'IconCalendar',
      isCustom: false,
      isActive: true,
      isSystem: true,
      isNullable: false,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
    {
      __typename: 'field',
      id: '20202020-20e1-4366-b386-750bdca2dfe3',
      type: 'DATE_TIME',
      name: 'dueAt',
      label: 'Due Date',
      description: 'Activity due date',
      icon: 'IconCalendarEvent',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '2023-11-24T03:29:18.228Z',
      updatedAt: '2023-11-24T03:29:18.228Z',
      fromRelationMetadata: null,
      toRelationMetadata: null,
    },
  ] as FieldMetadataItem[],
};
