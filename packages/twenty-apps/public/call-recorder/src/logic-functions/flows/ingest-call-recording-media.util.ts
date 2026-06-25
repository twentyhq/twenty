import { isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video'
>;

const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;

export const ingestCallRecordingMedia = async ({
  callRecordingId,
  externalRecordingId,
  hasAudio,
  hasVideo,
}: {
  callRecordingId: string;
  externalRecordingId: string;
  hasAudio: boolean;
  hasVideo: boolean;
}): Promise<CallRecordingMediaUpdateFields> => {
  if (hasAudio && hasVideo) {
    return {};
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while ingesting media for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return {};
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);
  const metadataClient = new MetadataApiClient();
  const updateFields: CallRecordingMediaUpdateFields = {};

  if (!hasVideo && !isUndefined(mediaUrls.videoUrl)) {
    const video = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isUndefined(video)) {
      updateFields.video = video;
    }
  }

  if (!hasAudio && !isUndefined(mediaUrls.audioUrl)) {
    const audio = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.audioUrl,
      fileName: 'audio.mp3',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isUndefined(audio)) {
      updateFields.audio = audio;
    }
  }

  return updateFields;
};

const ingestMediaArtifact = async ({
  callRecordingId,
  metadataClient,
  url,
  fileName,
  fieldMetadataUniversalIdentifier,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  url: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
}): Promise<CallRecordingMediaFile[] | undefined> => {
  try {
    const { buffer, contentType } = await downloadMediaFile(url);
    const uploadedFile = await metadataClient.uploadFile(
      buffer,
      fileName,
      contentType,
      fieldMetadataUniversalIdentifier,
    );

    return [{ fileId: uploadedFile.id, label: fileName }];
  } catch (error) {
    console.warn(
      `[call-recorder] failed to ingest ${fileName} for call recording ${callRecordingId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

const downloadMediaFile = async (
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType:
      response.headers.get('content-type') ?? 'application/octet-stream',
  };
};
