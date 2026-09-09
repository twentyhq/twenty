export type TwentyClientRunAsWorkspaceMember = { workspaceMemberId: string };

export type TwentyClientRunAs =
  | 'user'
  | 'application'
  | TwentyClientRunAsWorkspaceMember;
