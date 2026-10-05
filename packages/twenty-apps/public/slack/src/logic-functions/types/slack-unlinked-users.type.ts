import { type SlackUserSearchOption } from 'src/logic-functions/types/slack-user-search.type';

export type SlackUnlinkedUsersResult =
  | { success: true; slackUsers: SlackUserSearchOption[]; hasMore: boolean }
  | { success: false; message: string; error: string };
