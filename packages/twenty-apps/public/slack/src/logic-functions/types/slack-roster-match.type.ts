import { type SlackRosterMatchSummary } from 'src/logic-functions/utils/match-slack-roster-by-email';

export type SlackRosterMatchResult =
  | ({ success: true; message: string } & SlackRosterMatchSummary)
  | { success: false; message: string; error: string };
