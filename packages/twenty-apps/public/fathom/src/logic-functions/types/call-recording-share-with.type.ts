export type CallRecordingShareWith =
  | { workspaceMemberId: string; accessLevel: 'FULL' }
  | { everyone: true; accessLevel: 'READ' };
