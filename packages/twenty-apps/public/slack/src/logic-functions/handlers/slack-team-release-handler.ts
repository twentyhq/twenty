import { type SlackConnectionHookPayload } from 'src/logic-functions/types/slack-connection-hook-payload.type';
import { releaseSlackTeam } from 'src/logic-functions/utils/release-slack-team';

export const slackTeamReleaseHandler = (payload: SlackConnectionHookPayload) =>
  releaseSlackTeam({
    connectedAccountId: payload.connectedAccountId,
  });
