import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  executeCurrentSchemaMutation,
  type CurrentSchemaUpdateCallRecordingsMutation,
} from 'src/logic-functions/data/execute-current-schema-mutation.util';

const NON_TERMINAL_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
] satisfies CallRecordingStatus[];

export const completeCallRecordingIngestion = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const mutation = {
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        },
        data: { status: CallRecordingStatus.COMPLETED },
      },
      id: true,
    },
  } satisfies CurrentSchemaUpdateCallRecordingsMutation;

  const result = await executeCurrentSchemaMutation(client, mutation);

  return (result.updateCallRecordings ?? []).length > 0;
};
