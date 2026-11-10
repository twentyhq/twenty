export const buildInvitationSendingThrottleKey = (emailOrWorkspaceId: string) =>
  `invitation-resending-workspace:throttler:${emailOrWorkspaceId}`;
