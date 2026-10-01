export type NotifyFirstCallRecordingResult =
  | { outcome: 'not-completed' }
  | { outcome: 'notified'; notifiedWorkspaceMemberIds: string[] };
