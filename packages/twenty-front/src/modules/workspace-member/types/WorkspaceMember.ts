import {
  WorkspaceMemberDateFormat,
  WorkspaceMemberTimeFormat,
} from '~/generated/graphql';

export type ColorScheme = 'Dark' | 'Light' | 'System';

export type WorkspaceMember = {
  __typename: 'WorkspaceMember';
  id: string;
  name: {
    __typename?: 'FullName';
    firstName: string;
    lastName: string;
  };
  avatarUrl?: string | null;
  locale: string;
  timeZone: string;
  dateFormat: WorkspaceMemberDateFormat;
  timeFormat: WorkspaceMemberTimeFormat;
  colorScheme?: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
};
