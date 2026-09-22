export type SlackChannelRuleRecord = {
  id: string;
  name: string | null;
  slackChannelId: string | null;
  slackTeamId: string | null;
  mode: string | null;
  capability: string | null;
};
