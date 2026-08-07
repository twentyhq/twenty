import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type NotificationStatus = 'UNREAD' | 'READ' | 'DONE';

export type Notification = ObjectRecord & {
  type: string;
  title: string;
  preview: string | null;
  status: NotificationStatus;
  requiresAction: boolean;
  threadId: string | null;
  subjectRecordId: string | null;
  payload: ({ objectNameSingular?: string } & Record<string, unknown>) | null;
  workspaceMemberId: string;
  createdAt: string;
};
