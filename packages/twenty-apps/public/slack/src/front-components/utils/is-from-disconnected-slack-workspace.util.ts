import { isNonEmptyString } from '@sniptt/guards';

export const DISCONNECTED_SLACK_WORKSPACE_LABEL =
  'Slack workspace disconnected';

export const isFromDisconnectedSlackWorkspace = ({
  slackTeamId,
  installedSlackTeamId,
}: {
  slackTeamId: string | null;
  installedSlackTeamId: string | undefined;
}): boolean =>
  isNonEmptyString(installedSlackTeamId) &&
  isNonEmptyString(slackTeamId) &&
  slackTeamId !== installedSlackTeamId;
