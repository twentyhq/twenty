import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { extractRecallMediaUrls } from 'src/logic-functions/utils/extract-recall-media-urls.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/utils/update-call-recording.util';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video'
>;

// Inner bound per artifact — the runtime's timeoutSeconds is the outer kill
// switch; a stalled transfer must not consume the whole function budget.
const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;

// Failed artifacts are omitted; the reconciler retries them with fresh URLs.
export const ingestRecallMedia = async ({
  callRecordingId,
  bot,
  hasAudio,
  hasVideo,
}: {
  callRecordingId: string;
  bot: Record<string, unknown>;
  hasAudio: boolean;
  hasVideo: boolean;
}): Promise<CallRecordingMediaUpdateFields> => {
  const mediaUrls = extractRecallMediaUrls(bot);
  const metadataClient = new MetadataApiClient();
  const updateFields: CallRecordingMediaUpdateFields = {};

  if (!hasVideo && mediaUrls.videoUrl !== undefined) {
    const video = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.fields.video
          .universalIdentifier,
    });

    if (video !== undefined) {
      updateFields.video = video;
    }
  }

  if (!hasAudio && mediaUrls.audioUrl !== undefined) {
    const audio = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.audioUrl,
      fileName: 'audio.mp3',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.fields.audio
          .universalIdentifier,
    });

    if (audio !== undefined) {
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
}): Promise<{ fileId: string; label: string }[] | undefined> => {
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
      `[recall-recording-bot] failed to ingest ${fileName} for call recording ${callRecordingId}: ${error instanceof Error ? error.message : String(error)}`,
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
