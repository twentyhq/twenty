import {
  WorkspaceMemberColorSchemeEnum,
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberLocaleEnum,
  WorkspaceMemberTimeFormatEnum,
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
  locale: WorkspaceMemberLocaleEnum;
  timeZone: string;
  dateFormat: WorkspaceMemberDateFormatEnum;
  timeFormat: WorkspaceMemberTimeFormatEnum;
  colorScheme?: WorkspaceMemberColorSchemeEnum;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
};
