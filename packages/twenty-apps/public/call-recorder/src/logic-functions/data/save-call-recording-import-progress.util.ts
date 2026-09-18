import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { parseUnrecoverableMediaMarkers } from 'src/logic-functions/domain/parse-unrecoverable-media-markers.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Queue redelivery can overlap a Lambda that is still running.
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
    const currentCallRecording = await findCallRecordingForArtifactsImport(
      client,
      callRecordingId,
    );

    if (
      isUndefined(currentCallRecording) ||
      currentCallRecording.status !== CallRecordingStatus.PROCESSING ||
      currentCallRecording.externalBotId !== externalBotId
    ) {
      return;
    }

    const transcriptMarker = parseTranscriptMarker(
      currentCallRecording.transcript,
    );

    if (
      !isUndefined(data.transcript) &&
      !isUndefined(currentCallRecording.transcript) &&
      (transcriptMarker?.status !== 'PENDING' ||
        parseTranscriptMarker(data.transcript)?.status === 'PENDING')
    ) {
      return;
    }

    const { isAudioUnrecoverable, isVideoUnrecoverable } =
      parseUnrecoverableMediaMarkers(
        currentCallRecording.callRecorderFailureReason,
      );
    const isResolvedByMediaField = {
      audio:
        isNonEmptyArray(currentCallRecording.audio) || isAudioUnrecoverable,
      video:
        isNonEmptyArray(currentCallRecording.video) || isVideoUnrecoverable,
    };
    const { audio, video, callRecorderFailureReason, ...otherUpdateData } =
      data;

    const failureReasons = (callRecorderFailureReason ?? '')
      .split(',')
      .filter(isNonEmptyString)
      .filter(
        (reason) =>
          !(['audio', 'video'] as const).some(
            (field) =>
              isResolvedByMediaField[field] && reason.startsWith(`${field}_`),
          ),
      );

    const mergedCallRecorderFailureReason = [
      ...new Set([
        ...(currentCallRecording.callRecorderFailureReason ?? '')
          .split(',')
          .filter(isNonEmptyString),
        ...failureReasons,
      ]),
    ].join(',');
    const updateData: CallRecordingUpdateFields = {
      ...otherUpdateData,
      ...(isResolvedByMediaField.audio || isUndefined(audio) ? {} : { audio }),
      ...(isResolvedByMediaField.video || isUndefined(video) ? {} : { video }),
      ...(!isUndefined(callRecorderFailureReason) &&
      mergedCallRecorderFailureReason !==
        (currentCallRecording.callRecorderFailureReason ?? '')
        ? { callRecorderFailureReason: mergedCallRecorderFailureReason }
        : {}),
    };

    if (!hasCallRecordingUpdateFields(updateData)) {
      return;
    }

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
              currentCallRecording.callRecorderFailureReason,
            )
              ? { is: 'NULL' }
              : { eq: currentCallRecording.callRecorderFailureReason },
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

    if (isNonEmptyArray(result.updateCallRecordings)) {
      return;
    }
  }

  throw new Error(
    `Call recording ${callRecordingId} changed while saving import progress`,
  );
};
