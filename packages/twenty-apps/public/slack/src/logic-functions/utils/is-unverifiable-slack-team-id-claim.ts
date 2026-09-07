import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

// Claiming a workspace other than the installed one is what skips the consent
// request, so a claim Slack will not corroborate has to fail closed.
export const isUnverifiableSlackTeamIdClaim = ({
  requestedSlackTeamId,
  resolvedSlackAccount,
  installedSlackTeamId,
}: {
  requestedSlackTeamId: string | undefined;
  resolvedSlackAccount: { slackTeamId: string | undefined } | undefined;
  installedSlackTeamId: string;
}): boolean =>
  isDefined(resolvedSlackAccount) &&
  isNonEmptyString(requestedSlackTeamId) &&
  !isNonEmptyString(resolvedSlackAccount.slackTeamId) &&
  requestedSlackTeamId !== installedSlackTeamId;
