import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  SEND_DISCORD_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
  SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SEND_DISCORD_MESSAGE_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Send Discord message',
  shortLabel: 'Discord message',
  icon: 'IconBrandDiscord',
  isPinned: false,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
