import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  type CaptureMediaResult,
  recordAudio,
  recordVideo,
} from 'twenty-sdk/front-component';

import { RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from '../objects/media-note.object';
import { MEDIA_NOTES_TEST_IDS } from './media-notes-test-ids';

export const MEDIA_NOTES_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '14695714-35b5-4814-9489-f65c12368b5c';

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1961ed',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  marginRight: '8px',
  padding: '8px 12px',
};

// An app declares its fields by universalIdentifier; the per-instance
// fieldMetadataId that captureMedia needs is resolved at runtime. The
// metadata API cannot filter on universalIdentifier, so scan the object list.
const fetchRecordingFieldMetadataId = async (): Promise<string | null> => {
  const result = await new MetadataApiClient().query({
    objects: {
      __args: { paging: { first: 200 } },
      edges: {
        node: {
          fieldsList: { id: true, universalIdentifier: true },
        },
      },
    },
  });

  const fields = (result.objects?.edges ?? []).flatMap(
    (edge) => edge.node?.fieldsList ?? [],
  );

  return (
    fields.find(
      (field) =>
        field.universalIdentifier === RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
    )?.id ?? null
  );
};

const describeResult = (result: CaptureMediaResult): string =>
  result.status === 'failed' ? `failed:${result.reason}` : result.status;

const MediaNotes = () => {
  const [recordingFieldMetadataId, setRecordingFieldMetadataId] = useState<
    string | null
  >(null);
  const [captureResult, setCaptureResult] = useState<CaptureMediaResult | null>(
    null,
  );
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordingFieldMetadataId()
      .then(setRecordingFieldMetadataId)
      .catch(() => setRecordingFieldMetadataId(null));
  }, []);

  const handleCapture = async (mediaType: 'audio' | 'video') => {
    if (recordingFieldMetadataId === null) {
      return;
    }

    setCaptureResult(null);
    setSavedRecordId(null);

    const params = {
      fieldMetadataId: recordingFieldMetadataId,
      maxDurationSeconds: 60,
    };

    const result =
      mediaType === 'audio'
        ? await recordAudio(params)
        : await recordVideo(params);

    setCaptureResult(result);

    if (result.status !== 'captured') {
      return;
    }

    // Attaching the uploaded file to a record is what makes it permanent:
    // until then it is a temporary file owned by the FILES field.
    const created = await new CoreApiClient().mutation({
      createMediaNote: {
        __args: {
          data: {
            title: `${mediaType} note`,
            recording: [
              { fileId: result.file.fileId, label: result.file.path },
            ],
          },
        },
        id: true,
      },
    });

    setSavedRecordId(created.createMediaNote?.id ?? null);
  };

  return (
    <div
      data-testid={MEDIA_NOTES_TEST_IDS.root}
      style={{ fontFamily: 'sans-serif', padding: '16px' }}
    >
      <h3 style={{ fontSize: '15px', margin: '0 0 12px' }}>Media notes</h3>
      <p style={{ color: '#555', fontSize: '13px', margin: '0 0 16px' }}>
        Record a note with your microphone or camera. The recording is stored
        in Twenty and attached to a Media note record.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <button
          data-testid={MEDIA_NOTES_TEST_IDS.recordAudioButton}
          style={buttonStyle}
          disabled={recordingFieldMetadataId === null}
          onClick={() => handleCapture('audio')}
        >
          Record a voice note
        </button>
        <button
          data-testid={MEDIA_NOTES_TEST_IDS.recordVideoButton}
          style={buttonStyle}
          disabled={recordingFieldMetadataId === null}
          onClick={() => handleCapture('video')}
        >
          Record a video note
        </button>
      </div>

      {captureResult !== null && (
        <div
          data-testid={MEDIA_NOTES_TEST_IDS.captureStatus}
          style={{ color: '#333', fontSize: '13px', marginBottom: '12px' }}
        >
          {describeResult(captureResult)}
        </div>
      )}

      {captureResult?.status === 'captured' && (
        <div
          data-testid={MEDIA_NOTES_TEST_IDS.capturedFile}
          style={{
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '12px',
            padding: '12px',
          }}
        >
          <p style={{ margin: '0 0 8px' }}>
            {captureResult.file.mimeType} · {captureResult.file.durationSeconds}
            s · {Math.round(captureResult.file.size / 1024)} KB
          </p>
          {captureResult.file.mimeType.startsWith('audio/') ? (
            <audio
              data-testid={MEDIA_NOTES_TEST_IDS.capturedAudio}
              controls
              src={captureResult.file.url}
              style={{ width: '100%' }}
            />
          ) : (
            <video
              data-testid={MEDIA_NOTES_TEST_IDS.capturedVideo}
              controls
              src={captureResult.file.url}
              style={{ maxHeight: '200px', width: '100%' }}
            />
          )}
          {savedRecordId !== null && (
            <p
              data-testid={MEDIA_NOTES_TEST_IDS.savedRecord}
              style={{ color: '#555', margin: '8px 0 0' }}
            >
              Attached to media note {savedRecordId}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MEDIA_NOTES_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'media-notes-component',
  description: 'Record audio or video notes with the captureMedia capability',
  component: MediaNotes,
});
