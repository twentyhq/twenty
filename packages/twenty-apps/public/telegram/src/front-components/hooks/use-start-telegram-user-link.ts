import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TELEGRAM_USER_LINKS_START_ROUTE_PATH } from 'src/logic-functions/constants/telegram-user-links-route-path';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';
import { type TelegramStartUserLinkResult } from 'src/logic-functions/types/telegram-start-user-link-result.type';

type StartState =
  | { status: 'IDLE' }
  | { status: 'STARTING' }
  | {
      status: 'READY';
      url: string;
      botUsername: string;
      startCommand: string;
    }
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
        result?.success
          ? {
              status: 'READY',
              url: result.url,
              botUsername: result.botUsername,
              startCommand: result.startCommand,
            }
          : { status: 'FAILED', message: result?.message ?? '' },
      );
    } catch (error) {
      console.error('[telegram] could not start the connection', error);
      setStartState({ status: 'FAILED', message: toErrorMessage(error) });
    }
  };

  return { startState, startTelegramUserLink };
};
