import { type SlackConnectionHookPayload } from 'src/logic-functions/types/slack-connection-hook-payload.type';
import { releaseSlackTeamOnDisconnect } from 'src/logic-functions/utils/release-slack-team-on-disconnect';

export const slackTeamReleaseHandler = (payload: SlackConnectionHookPayload) =>
  releaseSlackTeamOnDisconnect({
    connectedAccountId: payload.connectedAccountId,
  });
