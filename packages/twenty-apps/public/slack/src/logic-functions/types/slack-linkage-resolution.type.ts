export type SlackLinkageResolution =
  | { status: 'LINKED'; workspaceMemberId: string }
  | { status: 'UNLINKED' }
  | { status: 'UNVERIFIABLE' };
