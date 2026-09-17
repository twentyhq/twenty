import { useCallback, useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import {
  type BackfillStatus,
  BACKFILL_STATUS_ROUTE_PATH,
} from 'src/constants/backfill';
import { BACKFILL_STATUS_POLL_INTERVAL_MS } from 'src/front-components/constants/backfill-status-poll-interval-ms';

type BackfillStatusState = {
  backfillStatus: BackfillStatus | undefined;
  refetchBackfillStatus: () => void;
};

const fetchBackfillStatus = async (): Promise<BackfillStatus | undefined> => {
  try {
    return await new RestApiClient().get<BackfillStatus>(
      `/s${BACKFILL_STATUS_ROUTE_PATH}`,
    );
  } catch {
    return undefined;
  }
};

export const useBackfillStatus = (): BackfillStatusState => {
  const [backfillStatus, setBackfillStatus] = useState<BackfillStatus>();

  const refetchBackfillStatus = useCallback(async () => {
    setBackfillStatus(await fetchBackfillStatus());
  }, []);

  const isRunInFlight =
    backfillStatus?.status === 'enqueueing' ||
    backfillStatus?.status === 'running';

  useEffect(() => {
    let isCurrent = true;

    const poll = async () => {
      const nextStatus = await fetchBackfillStatus();

      if (isCurrent) {
        setBackfillStatus(nextStatus);
      }
    };

    poll();

    if (!isRunInFlight) {
      return () => {
        isCurrent = false;
      };
    }

    const intervalId = setInterval(poll, BACKFILL_STATUS_POLL_INTERVAL_MS);

    return () => {
      isCurrent = false;
      clearInterval(intervalId);
    };
  }, [isRunInFlight]);

  return { backfillStatus, refetchBackfillStatus };
};
