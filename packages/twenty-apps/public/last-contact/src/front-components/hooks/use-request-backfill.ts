import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { BACKFILL_ROUTE_PATH } from 'src/constants/backfill';

type RequestBackfillState = {
  requestBackfill: () => Promise<string | undefined>;
  isRequestingBackfill: boolean;
};

export const useRequestBackfill = (): RequestBackfillState => {
  const [isRequestingBackfill, setIsRequestingBackfill] = useState(false);

  const requestBackfill = async (): Promise<string | undefined> => {
    setIsRequestingBackfill(true);

    try {
      const backfillResult = await new RestApiClient().post<{
        outcome?: unknown;
      }>(`/s${BACKFILL_ROUTE_PATH}`, {});

      return isString(backfillResult?.outcome)
        ? backfillResult.outcome
        : undefined;
    } catch {
      return undefined;
    } finally {
      setIsRequestingBackfill(false);
    }
  };

  return { requestBackfill, isRequestingBackfill };
};
