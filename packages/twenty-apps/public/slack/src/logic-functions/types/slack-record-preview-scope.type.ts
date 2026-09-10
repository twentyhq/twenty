// Whose permissions the record previews attached to an outgoing message are
// fetched with. Undefined keeps the run's own access, which is the person who
// triggered it when there is one.
export type SlackRecordPreviewScope =
  | { kind: 'workspaceMember'; workspaceMemberId: string }
  | { kind: 'none' };
