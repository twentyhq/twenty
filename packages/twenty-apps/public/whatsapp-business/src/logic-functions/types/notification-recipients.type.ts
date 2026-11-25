export type GetNotificationRecipientsResult = {
  workspaceMemberIds: string[];
  canEdit: boolean;
};

export type SetNotificationRecipientsResult =
  | { success: true }
  | { success: false; error: string };
