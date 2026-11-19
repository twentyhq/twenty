import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { OPEN_SCHEDULED_CALL_RECORDING_FILTER } from 'src/logic-functions/constants/open-scheduled-call-recording-filter';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';

export const findOpenOrLiveCallRecordings = async ({
  client,
  shouldStartPageRequest,
}: {
  client: CoreApiClient;
  shouldStartPageRequest: () => boolean;
}): Promise<CallRecordingRecord[]> =>
  findCallRecordingsByFilter(
    client,
    {
      or: [
        OPEN_SCHEDULED_CALL_RECORDING_FILTER,
        {
          status: {
            in: [CallRecordingStatus.JOINING, CallRecordingStatus.RECORDING],
          },
          externalBotId: { is: 'NOT_NULL' },
        },
      ],
    },
    shouldStartPageRequest,
  );
