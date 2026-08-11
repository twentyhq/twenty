import { type CoreApiClient } from 'twenty-client-sdk/core';

type CallRecordingIdNode = {
  id: string;
};

type CallRecordingIdConnection = {
  edges?: Array<{ node: CallRecordingIdNode }> | null;
};

export const hasCallRecordingWithRecallBotMarker = async (
  client: CoreApiClient,
): Promise<boolean> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: {
          and: [
            {
              or: [
                { botScheduleAttemptedAt: { is: 'NOT_NULL' } },
                { externalBotId: { is: 'NOT_NULL' } },
              ],
            },
            {
              or: [
                { deletedAt: { is: 'NULL' } },
                { deletedAt: { is: 'NOT_NULL' } },
              ],
            },
          ],
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const connection = queryResult.callRecordings as
    | CallRecordingIdConnection
    | undefined;

  return (connection?.edges ?? []).length > 0;
};
