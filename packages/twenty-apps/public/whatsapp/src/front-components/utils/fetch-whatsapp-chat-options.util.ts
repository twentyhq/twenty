import { RestApiClient } from 'twenty-client-sdk/rest';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { type WhatsappChatOptionsPage } from 'src/types/whatsapp-chat-options-page.type';

export const fetchWhatsappChatOptions = (
  limit: number,
): Promise<WhatsappChatOptionsPage> =>
  new RestApiClient().post<WhatsappChatOptionsPage>(
    `/s${WHATSAPP_SETTINGS_ROUTE_PATHS.listChats}`,
    { limit },
  );
