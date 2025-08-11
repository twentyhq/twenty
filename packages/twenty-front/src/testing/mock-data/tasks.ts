import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

type MockedTask = Task & { __typename?: string };

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

export const mockedTasks: Array<MockedTask> = [
  {
    id: '3ecaa1be-aac7-463a-a38e-64078dd451d5',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    title: 'My very first task',
    bodyV2: {
      blocknote: null,
      markdown: null,
    },
    dueAt: '2023-04-26T10:12:42.33625+00:00',
    status: 'TODO',
    assignee: workspaceMember,
    assigneeId: workspaceMember.id,
    taskTargets: [
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb300',
        createdAt: '2023-04-26T10:12:42.33625+00:00',
        updatedAt: '2023-04-26T10:23:42.33625+00:00',
        targetObjectNameSingular: 'company',
        personId: null,
        companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
        company: {
          __typename: 'Company',
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb280',
          name: 'Airbnb',
          domainName: {
            primaryLinkLabel: '',
            primaryLinkUrl: 'https://www.airbnb.com',
          },
        },
        person: null,
        taskId: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
        task: {
          __typename: 'Task',
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb230',
          createdAt: '2023-04-26T10:12:42.33625+00:00',
          updatedAt: '2023-04-26T10:23:42.33625+00:00',
        },
        __typename: 'TaskTarget',
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
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
          name: 'Aircall',
          domainName: 'aircall.io',
        },
        person: null,
        taskId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
        task: {
          __typename: 'Task',
          id: '89bb825c-171e-4bcc-9cf7-43448d6fb231',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        __typename: 'TaskTarget',
      },
    ] as Array<TaskTarget>,
    __typename: 'Task',
  },
];
