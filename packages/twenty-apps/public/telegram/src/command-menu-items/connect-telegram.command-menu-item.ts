import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  CONNECT_TELEGRAM_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  CONNECT_TELEGRAM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: CONNECT_TELEGRAM_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Connect Telegram',
  shortLabel: 'Telegram',
  icon: 'IconBrandTelegram',
  isPinned: false,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    CONNECT_TELEGRAM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
