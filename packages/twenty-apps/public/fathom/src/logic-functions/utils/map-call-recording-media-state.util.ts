import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';

import {
  type callRecordingMediaStateNodeSchema,
  fathomMediaUploadCheckpointSchema,
} from 'src/logic-functions/schemas/call-recording-media-state-query-result.schema';
import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { isDefined } from 'src/utils/is-defined';

export const mapCallRecordingMediaState = (
  node: z.infer<typeof callRecordingMediaStateNodeSchema>,
): CallRecordingMediaState => {
  const recordingImport = node.fathomRecordingImports?.edges[0]?.node;
  const uploadCheckpointResult = fathomMediaUploadCheckpointSchema.safeParse(
    recordingImport?.mediaUploadCheckpoint,
  );

  return {
    id: node.id,
    updatedAt: node.updatedAt,
    fathomRecordingImportId: isNonEmptyString(recordingImport?.id)
      ? recordingImport.id
      : undefined,
    fathomRecordingImportUpdatedAt: isNonEmptyString(recordingImport?.updatedAt)
      ? recordingImport.updatedAt
      : undefined,
    recordingId: isNonEmptyString(recordingImport?.recordingId)
      ? recordingImport.recordingId
      : undefined,
    hasVideo:
      node.video?.some((file) => isNonEmptyString(file.fileId)) ?? false,
    hasAudio:
      node.audio?.some((file) => isNonEmptyString(file.fileId)) ?? false,
    hasTranscript: isNonEmptyArray(node.transcript),
    hasSummary:
      isNonEmptyString(node.summary?.markdown) ||
      isDefined(node.summary?.blocknote),
    failureReason: isNonEmptyString(recordingImport?.mediaFailureReason)
      ? recordingImport.mediaFailureReason
      : undefined,
    connectedAccountId: isNonEmptyString(recordingImport?.connectedAccountId)
      ? recordingImport.connectedAccountId
      : undefined,
    downloadId: isNonEmptyString(recordingImport?.mediaDownloadId)
      ? recordingImport.mediaDownloadId
      : undefined,
    uploadCheckpoint: uploadCheckpointResult.success
      ? uploadCheckpointResult.data
      : undefined,
  };
};
