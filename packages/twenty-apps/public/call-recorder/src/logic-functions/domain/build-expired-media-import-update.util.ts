import { isNonEmptyArray } from '@sniptt/guards';

import {
  AUDIO_IMPORT_EXPIRED_FAILURE_REASON,
  VIDEO_IMPORT_EXPIRED_FAILURE_REASON,
} from 'src/logic-functions/constants/media-import-expired-failure-reasons';
import { parseUnrecoverableMediaMarkers } from 'src/logic-functions/domain/parse-unrecoverable-media-markers.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const buildExpiredMediaImportUpdate = ({
  audio,
  video,
  callRecorderFailureReason,
}: {
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  callRecorderFailureReason: string | undefined;
}): Pick<CallRecordingUpdateFields, 'callRecorderFailureReason'> => {
  const { isAudioUnrecoverable, isVideoUnrecoverable } =
    parseUnrecoverableMediaMarkers(callRecorderFailureReason);
  const expiredFailureReasons = [
    ...(isNonEmptyArray(video) || isVideoUnrecoverable
      ? []
      : [VIDEO_IMPORT_EXPIRED_FAILURE_REASON]),
    ...(isNonEmptyArray(audio) || isAudioUnrecoverable
      ? []
      : [AUDIO_IMPORT_EXPIRED_FAILURE_REASON]),
  ];

  if (expiredFailureReasons.length === 0) {
    return {};
  }

  return {
    callRecorderFailureReason: [
      callRecorderFailureReason,
      ...expiredFailureReasons,
    ]
      .filter(isNonEmptyString)
      .join(','),
  };
};
