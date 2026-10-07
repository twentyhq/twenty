// Visibility in the root-domain sign-in picker, each level hiding strictly more than the previous:
// PUBLIC is discoverable by approved access email domain, MEMBERS_AND_INVITEES is shown only to members and invitees,
// HIDDEN is never listed and members and invitees sign in from the workspace URL.
export enum WorkspaceDiscoverability {
  PUBLIC = 'PUBLIC',
  MEMBERS_AND_INVITEES = 'MEMBERS_AND_INVITEES',
  HIDDEN = 'HIDDEN',
}
