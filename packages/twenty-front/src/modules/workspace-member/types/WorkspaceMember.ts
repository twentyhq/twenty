import {
  type WorkspaceMemberDateFormatEnum,
  type WorkspaceMemberNumberFormatEnum,
  type WorkspaceMemberTimeFormatEnum,
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
  locale: string | null;
  colorScheme: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
  timeZone?: string | null;
  dateFormat?: WorkspaceMemberDateFormatEnum | null;
  timeFormat?: WorkspaceMemberTimeFormatEnum | null;
  numberFormat?: WorkspaceMemberNumberFormatEnum | null;
  calendarStartDay?: number | null;
};

export type WorkspaceInvitation = {
  __typename: 'WorkspaceInvitation';
  id: string;
  email: string;
  expiresAt: string;
};
