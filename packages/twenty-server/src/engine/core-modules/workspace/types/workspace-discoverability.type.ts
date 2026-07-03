// Ordered privacy levels controlling how a workspace surfaces in the
// root-domain (app.twenty.com) sign-in picker. Each level hides strictly more
// than the previous one:
// - PUBLIC: discoverable by anyone whose email domain matches an approved access domain
// - MEMBERS_AND_INVITEES: hidden from email-domain discovery, still shown to members and invited users
// - HIDDEN: never listed in the picker; members and invited users sign in from the workspace URL directly
export enum WorkspaceDiscoverability {
  PUBLIC = 'PUBLIC',
  MEMBERS_AND_INVITEES = 'MEMBERS_AND_INVITEES',
  HIDDEN = 'HIDDEN',
}
