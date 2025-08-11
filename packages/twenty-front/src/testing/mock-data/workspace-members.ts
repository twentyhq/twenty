import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

export const mockWorkspaceMembers: WorkspaceMember[] = [
  {
    id: '20202020-463f-435b-828c-107e007a2711',
    name: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
    __typename: 'WorkspaceMember',
    userEmail: 'jane.doe@twenty.com',
    locale: 'en',
    avatarUrl: '',
    createdAt: '2023-12-18T09:51:19.645Z',
    updatedAt: '2023-12-18T09:51:19.645Z',
    userId: '20202020-7169-42cf-bc47-1cfef15264b8',
    colorScheme: 'Light' as const,
    timeZone: 'America/New_York',
    dateFormat: WorkspaceMemberDateFormatEnum.DAY_FIRST,
    timeFormat: WorkspaceMemberTimeFormatEnum.HOUR_24,
  },
  {
    id: '20202020-77d5-4cb6-b60a-f4a835a85d61',
    name: {
      firstName: 'John',
      lastName: 'Wick',
    },
    userEmail: 'john.wick@twenty.com',
    __typename: 'WorkspaceMember',
    locale: 'en',
    avatarUrl: '',
    createdAt: '2023-12-18T09:51:19.645Z',
    updatedAt: '2023-12-18T09:51:19.645Z',
    userId: '20202020-3957-4908-9c36-2929a23f8357',
    colorScheme: 'Dark' as const,
    timeZone: 'America/New_York',
    dateFormat: WorkspaceMemberDateFormatEnum.DAY_FIRST,
    timeFormat: WorkspaceMemberTimeFormatEnum.HOUR_24,
  },
];

export const mockCurrentWorkspaceMembers: CurrentWorkspaceMember[] =
  mockWorkspaceMembers.map(
    ({
      id,
      locale,
      name,
      avatarUrl,
      colorScheme,
      dateFormat,
      timeFormat,
      timeZone,
      userEmail,
    }) => ({
      id,
      locale,
      name,
      avatarUrl,
      colorScheme,
      dateFormat,
      timeFormat,
      timeZone,
      userEmail,
    }),
  );
