import { type ColorScheme } from '@/ui/theme/types/ColorScheme';
import { type UiScale } from '@/ui/theme/types/UiScale';
import { type OpenRecordIn } from 'twenty-shared/types';
import {
  type InboxNotificationLevel,
  type WorkspaceMemberDateFormatEnum,
  type WorkspaceMemberNumberFormatEnum,
  type WorkspaceMemberTimeFormatEnum,
} from '~/generated-metadata/graphql';

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
  uiScale?: UiScale | null;
  openRecordIn?: OpenRecordIn;
  inboxNotificationLevel?: InboxNotificationLevel | null;
  isInboxNotificationPreviewEnabled?: boolean | null;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  jobTitle?: string | null;
  userId: string;
  userWorkspaceId?: string | null;
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
  roleId?: string | null;
  expiresAt: string;
};
