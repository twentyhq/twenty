import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
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
  | 'reminderAt'
  | 'assigneeId'
> & {
  author: WorkspaceMember;
  assignee: WorkspaceMember;
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
      | 'targetObjectNameSingular'
    > & {
      activity: Pick<Activity, 'id' | 'createdAt' | 'updatedAt' | '__typename'>;
      person?: ObjectRecord | null;
      company?: ObjectRecord | null;
    }
  >;
};

const workspaceMember: WorkspaceMember = {
  __typename: 'WorkspaceMember',
  id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
  name: {
    firstName: 'Charles',
    lastName: 'Test',
  },
  avatarUrl: '',
  locale: 'en',
  createdAt: '2023-04-26T10:23:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  userId: 'e2409670-1088-46b4-858e-f20a598d9d0f',
  userEmail: 'charles@test.com',
  colorScheme: 'Light',
};

export const mockedTasks: Array<MockedActivity> = [
  {
    id: 'c554852c-b28a-4307-a41d-a7a0fdde3386',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    reminderAt: null,
    title: 'My very first task',
    type: 'Task',
    body: '',
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: workspaceMember,
    assignee: workspaceMember,
    assigneeId: workspaceMember.id,
    authorId: workspaceMember.id,
    comments: [],
    activityTargets: [],
    __typename: 'Activity',
  },
];

export const mockedActivities: Array<MockedActivity> = [
  {
    id: '3ecaa1be-aac7-463a-a38e-64078dd451d5',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    reminderAt: null,
    title: 'My very first note',
    type: 'Note',
    body: '',
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    completedAt: null,
    author: workspaceMember,
    assignee: workspaceMember,
    assigneeId: workspaceMember.id,
    authorId: workspaceMember.id,
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        targetObjectNameSingular: 'company',
        personId: null,
        companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
        company: {
          __typename: 'Company',
          id: '20202020-1455-4c57-afaf-dd5dc086361d',
          employees: null,
          createdAt: '2024-06-05T09:00:20.412Z',
          updatedAt: '2024-06-05T09:00:20.412Z',
          name: 'Algolia',
          idealCustomerProfile: false,
          accountOwner: null,
          accountOwnerId: null,
          domainName: 'algolia.com',
          address: '',
          previousEmployees: null,
          annualRecurringRevenue: {
            __typename: 'Currency',
            amountMicros: null,
            currencyCode: '',
          },
          position: 13,
          xLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
          linkedinLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
        },
        person: null,
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
        activity: {
          __typename: 'Activity',
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
        targetObjectNameSingular: 'company',
        personId: null,
        companyId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
        company: {
          __typename: 'Company',
          id: '20202020-1455-4c57-afaf-dd5dc086361d',
          employees: null,
          createdAt: '2024-06-05T09:00:20.412Z',
          updatedAt: '2024-06-05T09:00:20.412Z',
          name: 'Algolia',
          idealCustomerProfile: false,
          accountOwner: null,
          accountOwnerId: null,
          domainName: 'algolia.com',
          address: '',
          previousEmployees: null,
          annualRecurringRevenue: {
            __typename: 'Currency',
            amountMicros: null,
            currencyCode: '',
          },
          position: 13,
          xLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
          linkedinLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
        },
        person: null,
        activityId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
        activity: {
          __typename: 'Activity',
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
    reminderAt: null,
    title: 'Another note',
    body: '',
    type: 'Note',
    completedAt: null,
    dueAt: '2029-08-26T10:12:42.33625+00:00',
    author: {
      ...workspaceMember,
      colorScheme: 'Dark',
    },
    assignee: { ...workspaceMember, colorScheme: 'Dark' },
    assigneeId: workspaceMember.id,
    authorId: workspaceMember.id,
    comments: [],
    activityTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278t',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        targetObjectNameSingular: 'person',
        personId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b', // Alexandre
        person: {
          __typename: 'Person',
          id: '20202020-ac73-4797-824e-87a1f5aea9e0',
          email: 'sylvie.palmer@linkedin.com',
          bestCompany: null,
          position: 2,
          testJson: null,
          testRating: 'RATING_5',
          testMultiSelect: ['OPTION_2', 'OPTION_3', 'OPTION_4'],
          testBoolean: false,
          testSelect: null,
          testDateOnly: '2024-06-06T00:00:00.000Z',
          phone: '+33780123456',
          createdAt: '2024-06-05T09:00:20.412Z',
          city: 'Los Angeles',
          testPhone: '',
          jobTitle: 'CEO',
          testCurrency: {
            __typename: 'Currency',
            amountMicros: 20323000000,
            currencyCode: 'USD',
          },
          xLink: {
            __typename: 'Link',
            label: '',
            url: 'twitter.com',
          },
          testLinks: {
            __typename: 'Links',
            primaryLinkUrl: 'https://algolia.com',
            primaryLinkLabel: '',
            secondaryLinks: [
              {
                url: 'https://paris.com',
                label: '',
              },
            ],
          },
          name: {
            __typename: 'FullName',
            firstName: 'Sylvie',
            lastName: 'Palmer',
          },
          linkedinLink: {
            __typename: 'Link',
            label: '',
            url: 'linkedin.com',
          },
          testAddress: {
            __typename: 'Address',
            addressStreet1: '',
            addressStreet2: '',
            addressCity: '',
            addressState: '',
            addressCountry: '',
            addressPostcode: '',
            addressLat: null,
            addressLng: null,
          },
          testLink: {
            __typename: 'Link',
            label: '',
            url: '',
          },
          company: {
            __typename: 'Company',
            id: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
            employees: null,
            previousEmployeesId: '20202020-2d40-4e49-8df4-9c6a049191de',
            accountOwnerId: null,
            updatedAt: '2024-06-05T09:39:33.886Z',
            idealCustomerProfile: false,
            createdAt: '2024-06-05T09:00:20.412Z',
            name: 'Linkedin',
            domainName: 'linkedin.com',
            address: '',
            position: 1,
            linkedinLink: {
              __typename: 'Link',
              label: '',
              url: '',
            },
            annualRecurringRevenue: {
              __typename: 'Currency',
              amountMicros: null,
              currencyCode: '',
            },
            xLink: {
              __typename: 'Link',
              label: '',
              url: '',
            },
          },
        },
        company: null,
        companyId: null,
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
        activity: {
          __typename: 'Activity',
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
        targetObjectNameSingular: 'person',
        company: null,
        person: {
          __typename: 'Person',
          id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
          name: {
            firstName: 'Jean',
            lastName: "d'Eau",
          },
          avatarUrl: '',
        },
        activityId: '89bb825c-171e-4bcc-9cf7-43448d6fb278a',
        activity: {
          __typename: 'Activity',
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
