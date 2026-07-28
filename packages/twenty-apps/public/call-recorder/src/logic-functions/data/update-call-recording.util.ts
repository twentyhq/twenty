import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  executeCurrentSchemaMutation,
  type CurrentSchemaUpdateCallRecordingMutation,
} from 'src/logic-functions/data/execute-current-schema-mutation.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
  }: {
    id: string;
    data: CallRecordingUpdateFields;
  },
): Promise<void> => {
  const mutation = {
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  } satisfies CurrentSchemaUpdateCallRecordingMutation;

  await executeCurrentSchemaMutation(client, mutation);
};
