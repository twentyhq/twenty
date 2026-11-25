import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { defineFrontComponent } from 'twenty-sdk/define';

import { CONNECT_TELEGRAM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TelegramConnectSection } from 'src/front-components/components/TelegramConnectSection';

export default defineFrontComponent({
  universalIdentifier: CONNECT_TELEGRAM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'connect-telegram',
  description:
    'Gives the current member a one-time link that connects their Telegram account.',
  component: TelegramConnectSection,
});
