import { type SlackConnectionHookPayload } from 'src/logic-functions/types/slack-connection-hook-payload.type';
import { registerSlackConnection } from 'src/logic-functions/utils/register-slack-connection';

export const slackRegisterConnectionHandler = (
  payload: SlackConnectionHookPayload,
) =>
  registerSlackConnection({
    connectedAccountId: payload.connectedAccountId,
  });
