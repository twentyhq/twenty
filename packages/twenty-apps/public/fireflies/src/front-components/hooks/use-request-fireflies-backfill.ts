import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { FIREFLIES_BACKFILL_ROUTE_PATH } from 'src/constants/fireflies-backfill-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';

type RequestFirefliesBackfillState = {
  requestFirefliesBackfill: (days: number) => Promise<string | undefined>;
  isRequestingFirefliesBackfill: boolean;
};

export const useRequestFirefliesBackfill =
  (): RequestFirefliesBackfillState => {
    const [isRequestingFirefliesBackfill, setIsRequestingFirefliesBackfill] =
      useState(false);

    const requestFirefliesBackfill = async (
      days: number,
    ): Promise<string | undefined> => {
      setIsRequestingFirefliesBackfill(true);

      try {
        const client = new RestApiClient();
        const backfillResult = await client.post(
          `/s${FIREFLIES_BACKFILL_ROUTE_PATH}`,
          { days },
        );

        const outcome = asRecord(backfillResult)?.outcome;

        return isString(outcome) ? outcome : undefined;
      } catch {
        return undefined;
      } finally {
        setIsRequestingFirefliesBackfill(false);
      }
    };

    return { requestFirefliesBackfill, isRequestingFirefliesBackfill };
  };
