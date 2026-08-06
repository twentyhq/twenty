import { type SlackRegisterConnectionPayload } from 'src/logic-functions/types/slack-register-connection-payload.type';
import { registerSlackConnection } from 'src/logic-functions/utils/register-slack-connection';

export const slackRegisterConnectionHandler = (
  payload: SlackRegisterConnectionPayload,
) =>
  registerSlackConnection({
    connectedAccountId: payload.connectedAccountId,
  });
