import { type SlackAccessMode } from 'src/logic-functions/constants/slack-access-mode';
import { getSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';

export const slackAccessModeGetHandler = async (): Promise<{
  accessMode: SlackAccessMode;
}> => ({
  accessMode: await getSlackAccessMode(),
});
