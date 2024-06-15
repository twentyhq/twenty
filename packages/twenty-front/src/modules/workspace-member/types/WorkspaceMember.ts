import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

export type ColorScheme = 'Dark' | 'Light' | 'System';

export type WorkspaceMember = {
  __typename: 'WorkspaceMember';
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  avatarUrl?: string | null;
  locale: string;
  timeZone: string;
  dateFormat: DateFormat | WorkspaceMemberDateFormatEnum;
  timeFormat: TimeFormat | WorkspaceMemberTimeFormatEnum;
  colorScheme?: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
};
