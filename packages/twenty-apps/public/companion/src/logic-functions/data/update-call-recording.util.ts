import { isUndefined } from '@sniptt/guards';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
    expectedStatuses,
    expectedSummary,
  }: {
    id: string;
    data: CallRecordingUpdateFields;
    expectedStatuses?: CallRecordingStatus[];
    expectedSummary?: { markdown: string | undefined };
  },
): Promise<boolean> => {
  if (!isUndefined(expectedStatuses) || !isUndefined(expectedSummary)) {
    const result = await client.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: id },
            ...(!isUndefined(expectedStatuses)
              ? { status: { in: expectedStatuses } }
              : {}),
            ...(!isUndefined(expectedSummary)
              ? !isUndefined(expectedSummary.markdown)
                ? { summary: { markdown: { eq: expectedSummary.markdown } } }
                : {
                    or: [
                      { summary: { markdown: { is: 'NULL' as const } } },
                      { summary: { markdown: { eq: '' } } },
                    ],
                  }
              : {}),
          },
          data,
        },
        id: true,
      },
    });
    return (result.updateCallRecordings ?? []).length > 0;
  }

  await client.mutation({
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  });
  return true;
};
