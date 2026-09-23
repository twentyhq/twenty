import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';
import { readSlackAccessMode } from 'src/logic-functions/utils/read-slack-access-mode';

export const slackAccessModeGetHandler = async (): Promise<{
  accessMode: SlackAccessMode;
  isAccessModeReadable: boolean;
}> => {
  const result = await readSlackAccessMode();

  return result.status === 'READ'
    ? { accessMode: result.accessMode, isAccessModeReadable: true }
    : {
        accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
        isAccessModeReadable: false,
      };
};
