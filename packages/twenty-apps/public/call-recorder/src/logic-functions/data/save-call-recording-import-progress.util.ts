import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { parseUnrecoverableMediaMarkers } from 'src/logic-functions/domain/parse-unrecoverable-media-markers.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// A stalled queue worker can be redelivered while its Lambda is still running.
// Conditional writes keep that older attempt from replacing a saved outcome.
export const saveCallRecordingImportProgress = async (
  client: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
    data,
  }: {
    callRecordingId: string;
    externalBotId: string | undefined;
    data: CallRecordingUpdateFields;
  },
): Promise<void> => {
  if (!hasCallRecordingUpdateFields(data)) {
    return;
  }

  for (let saveAttempt = 0; saveAttempt < 3; saveAttempt++) {
    const current = await findCallRecordingForArtifactsImport(
      client,
      callRecordingId,
    );

    if (
      isUndefined(current) ||
      current.status !== CallRecordingStatus.PROCESSING ||
      current.externalBotId !== externalBotId
    ) {
      return;
    }

    const transcriptMarker = parseTranscriptMarker(current.transcript);

    if (
      !isUndefined(data.transcript) &&
      !isUndefined(current.transcript) &&
      (transcriptMarker?.status !== 'PENDING' ||
        parseTranscriptMarker(data.transcript)?.status === 'PENDING')
    ) {
      return;
    }

    const { isAudioUnrecoverable, isVideoUnrecoverable } =
      parseUnrecoverableMediaMarkers(current.callRecorderFailureReason);
    const resolved = {
      audio: isNonEmptyArray(current.audio) || isAudioUnrecoverable,
      video: isNonEmptyArray(current.video) || isVideoUnrecoverable,
    };
    const updateData = { ...data };

    for (const field of ['audio', 'video'] as const) {
      if (resolved[field]) delete updateData[field];
    }

    const failureReasons = (data.callRecorderFailureReason ?? '')
      .split(',')
      .filter(isNonEmptyString)
      .filter(
        (reason) =>
          !(['audio', 'video'] as const).some(
            (field) => resolved[field] && reason.startsWith(`${field}_`),
          ),
      );

    if (!isUndefined(data.callRecorderFailureReason)) {
      const merged = [
        ...new Set([
          ...(current.callRecorderFailureReason ?? '')
            .split(',')
            .filter(isNonEmptyString),
          ...failureReasons,
        ]),
      ].join(',');

      if (merged === (current.callRecorderFailureReason ?? '')) {
        delete updateData.callRecorderFailureReason;
      } else {
        updateData.callRecorderFailureReason = merged;
      }
    }

    if (!hasCallRecordingUpdateFields(updateData)) return;

    const result = await client.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
            status: { eq: CallRecordingStatus.PROCESSING },
            externalBotId: isUndefined(externalBotId)
              ? { is: 'NULL' }
              : { eq: externalBotId },
            callRecorderFailureReason: isUndefined(
              current.callRecorderFailureReason,
            )
              ? { is: 'NULL' }
              : { eq: current.callRecorderFailureReason },
            and: [
              ...(['audio', 'video'] as const)
                .filter(
                  (field) =>
                    !isUndefined(updateData[field]) ||
                    failureReasons.some((reason) =>
                      reason.startsWith(`${field}_`),
                    ),
                )
                .map((field) => ({
                  or: [
                    { [field]: { is: 'NULL' as const } },
                    { [field]: { like: '[]' } },
                  ],
                })),
              ...(isUndefined(updateData.transcript)
                ? []
                : [
                    {
                      or: [
                        { transcript: { is: 'NULL' as const } },
                        ...(parseTranscriptMarker(updateData.transcript)
                          ?.status === 'PENDING'
                          ? []
                          : [
                              {
                                transcript: { like: '{%"status": "PENDING"%}' },
                              },
                            ]),
                      ],
                    },
                  ]),
            ],
          },
          data: updateData,
        },
        id: true,
      },
    });

    if ((result.updateCallRecordings ?? []).length > 0) return;
  }

  throw new Error(
    `Call recording ${callRecordingId} changed while saving import progress`,
  );
};
