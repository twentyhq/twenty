import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';

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
  preferredTimeZone: string;
  preferredDateFormat: DateFormat;
  preferredTimeFormat: TimeFormat;
  colorScheme?: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
};
