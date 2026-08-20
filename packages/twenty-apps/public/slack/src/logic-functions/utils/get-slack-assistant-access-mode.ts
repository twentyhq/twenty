import { SLACK_ASSISTANT_ACCESS_ENV_VAR } from 'src/logic-functions/constants/slack-assistant-access-env-var';
import { SLACK_ASSISTANT_ACCESS_MODE } from 'src/logic-functions/constants/slack-assistant-access-mode';
import { type SlackAssistantAccessMode } from 'src/logic-functions/types/slack-assistant-access-mode.type';

export const getSlackAssistantAccessMode = (): SlackAssistantAccessMode =>
  process.env[SLACK_ASSISTANT_ACCESS_ENV_VAR]?.trim().toUpperCase() ===
  SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY
    ? SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY
    : SLACK_ASSISTANT_ACCESS_MODE.EVERYONE;
