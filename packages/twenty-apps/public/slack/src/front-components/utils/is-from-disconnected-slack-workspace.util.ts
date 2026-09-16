import { isNonEmptyString } from '@sniptt/guards';

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
