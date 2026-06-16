export type RecallBotMetadata = {
  // Workspace routing key echoed by Recall for shared webhook ingress.
  twentyWorkspaceId?: string;
  twentyCallRecordingId: string;
  twentyCalendarEventId: string;
  twentyRealMeetingKey: string;
  // Application routing key reserved for shared webhook ingress.
  twentyApplicationId?: string;
};
