import {
  SLACK_ACCESS_MODE,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';
import { readSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';

export const slackAccessModeGetHandler = async (): Promise<{
  accessMode: SlackAccessMode;
  isAccessModeReadable: boolean;
}> => {
  const result = await readSlackAccessMode();

  // The settings tab must be able to tell a stored setting from the fallback
  // enforcement uses, so the read outcome travels with the value.
  return result.status === 'READ'
    ? { accessMode: result.accessMode, isAccessModeReadable: true }
    : {
        accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
        isAccessModeReadable: false,
      };
};
