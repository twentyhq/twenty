import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CurrentSchemaMutationFunction = (
  mutation: CurrentSchemaUpdateCallRecordingMutation,
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

type CurrentSchemaMutationResult = {
  updateCallRecording?: { id?: string; status?: string | null } | null;
};

// TODO: Remove this bridge once the released SDK includes NOT_RECORDED.
export const executeCurrentSchemaMutation = (
  client: CoreApiClient,
  mutation: CurrentSchemaUpdateCallRecordingMutation,
): Promise<CurrentSchemaMutationResult> => {
  const currentSchemaClient = client as {
    mutation: CurrentSchemaMutationFunction;
  };

  return currentSchemaClient.mutation(mutation);
};
