import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { fetchWhatsappChatOptions } from 'src/front-components/utils/fetch-whatsapp-chat-options.util';
import { type WhatsappChatOptionsPage } from 'src/types/whatsapp-chat-options-page.type';

export const loadMoreWhatsappChatOptions = async (
  limit: number,
): Promise<WhatsappChatOptionsPage | undefined> => {
  try {
    return await fetchWhatsappChatOptions(limit);
  } catch {
    enqueueSnackbar({
      message: t('Could not load more WhatsApp conversations.'),
      variant: 'error',
    });

    return undefined;
  }
};
