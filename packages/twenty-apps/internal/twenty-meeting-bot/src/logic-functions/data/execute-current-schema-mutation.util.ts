import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingUpdateFields } from 'src/logic-functions/data/update-call-recording.util';

type CurrentSchemaMutationFunction = (
  mutation: CurrentSchemaMutation,
) => Promise<CurrentSchemaMutationResult>;

export type CurrentSchemaUpdateCallRecordingMutation = {
  updateCallRecording: {
    __args: {
      id: string;
      data: CallRecordingUpdateFields;
    };
    id?: true;
    status?: true;
  };
};

export type CurrentSchemaUpdateCallRecordingsMutation = {
  updateCallRecordings: {
    __args: {
      filter: {
        id: { eq: string };
        status?: { in: CallRecordingStatus[] };
      };
      data: Pick<CallRecordingUpdateFields, 'status'>;
    };
    id?: true;
  };
};

type CurrentSchemaMutation =
  | CurrentSchemaUpdateCallRecordingMutation
  | CurrentSchemaUpdateCallRecordingsMutation;

type CurrentSchemaMutationResult = {
  updateCallRecording?: { id?: string; status?: string | null } | null;
  updateCallRecordings?: { id?: string }[] | null;
};

// Typed bridge until the generated SDK includes the current CallRecording schema.
export const executeCurrentSchemaMutation = (
  client: CoreApiClient,
  mutation: CurrentSchemaMutation,
): Promise<CurrentSchemaMutationResult> => {
  const currentSchemaClient = client as {
    mutation: CurrentSchemaMutationFunction;
  };

  return currentSchemaClient.mutation(mutation);
};
