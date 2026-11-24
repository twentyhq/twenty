import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TELEGRAM_USER_LINKS_START_ROUTE_PATH } from 'src/logic-functions/constants/telegram-user-links-route-path';
import { type TelegramStartUserLinkResult } from 'src/logic-functions/types/telegram-start-user-link-result.type';

type StartState =
  | { status: 'IDLE' }
  | { status: 'STARTING' }
  | { status: 'READY'; url: string }
  | { status: 'FAILED'; message: string };

export const useStartTelegramUserLink = () => {
  const [startState, setStartState] = useState<StartState>({ status: 'IDLE' });

  const startTelegramUserLink = async (): Promise<void> => {
    setStartState({ status: 'STARTING' });

    try {
      const result = await new RestApiClient().post<
        TelegramStartUserLinkResult | undefined
      >(`/s${TELEGRAM_USER_LINKS_START_ROUTE_PATH}`, {});

      setStartState(
        result?.success === true
          ? { status: 'READY', url: result.url }
          : { status: 'FAILED', message: result?.message ?? '' },
      );
    } catch {
      setStartState({ status: 'FAILED', message: '' });
    }
  };

  return { startState, startTelegramUserLink };
};
