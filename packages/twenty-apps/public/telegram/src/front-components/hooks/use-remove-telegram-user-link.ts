import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TELEGRAM_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/logic-functions/constants/telegram-user-links-route-path';
import { type TelegramUserLinkActionResult } from 'src/logic-functions/types/telegram-user-link-action-result.type';

export const useRemoveTelegramUserLink = () => {
  const [removingLinkId, setRemovingLinkId] = useState<string | undefined>(
    undefined,
  );

  const removeTelegramUserLink = async (id: string): Promise<boolean> => {
    setRemovingLinkId(id);

    try {
      const result =
        await new RestApiClient().post<TelegramUserLinkActionResult>(
          `/s${TELEGRAM_USER_LINKS_REMOVE_ROUTE_PATH}`,
          { id },
        );

      return result.success;
    } catch (error) {
      console.error('[telegram] could not disconnect the account', error);

      return false;
    } finally {
      setRemovingLinkId(undefined);
    }
  };

  return { removeTelegramUserLink, removingLinkId };
};
