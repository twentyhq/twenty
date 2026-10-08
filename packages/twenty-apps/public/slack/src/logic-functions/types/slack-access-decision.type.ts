import { type SlackAccessDenialReason } from 'src/logic-functions/types/slack-access-denial-reason.type';

export type SlackAccessDecision =
  | { status: 'ALLOWED'; runAsWorkspaceMemberId: string }
  | { status: 'DENIED'; reason: SlackAccessDenialReason }
  | { status: 'UNVERIFIABLE' };
