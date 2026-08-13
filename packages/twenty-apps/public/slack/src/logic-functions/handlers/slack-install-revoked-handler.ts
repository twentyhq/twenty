import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type SlackInstallRevokedPayload } from 'src/logic-functions/types/slack-install-revoked-payload.type';
import { releaseSlackTeamOnInstallRevoked } from 'src/logic-functions/utils/release-slack-team-on-install-revoked';

export const slackInstallRevokedHandler = async (
  body: SlackInstallRevokedPayload,
) => {
  // The app only holds a bot token, so a revocation that spares it leaves the
  // install working.
  if (
    body.event?.type === 'tokens_revoked' &&
    !isNonEmptyArray(body.event.tokens?.bot)
  ) {
    return { ok: true, skipped: 'No bot token was revoked' };
  }

  if (!isNonEmptyString(body.team_id)) {
    throw new Error(
      'Slack install revocation event has no team_id; cannot release the team claim',
    );
  }

  return releaseSlackTeamOnInstallRevoked({
    teamId: body.team_id,
    claimedWorkspaceId: body.claimedWorkspaceId,
  });
};
