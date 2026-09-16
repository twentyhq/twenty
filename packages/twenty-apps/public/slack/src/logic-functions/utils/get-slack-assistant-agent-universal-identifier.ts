import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

export const getSlackAssistantAgentUniversalIdentifier = (
  capability: SlackChannelRuleCapability,
): string =>
  capability === SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY
    ? SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER
    : SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER;
