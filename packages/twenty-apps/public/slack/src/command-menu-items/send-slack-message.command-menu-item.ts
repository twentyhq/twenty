import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SEND_SLACK_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SEND_SLACK_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Send Slack message',
  shortLabel: 'Slack message',
  icon: 'IconBrandSlack',
  isPinned: false,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
