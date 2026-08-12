import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  type CaptureMediaResult,
  recordAudio,
  recordVideo,
} from 'twenty-sdk/front-component';

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

const describeResult = (result: CaptureMediaResult): string => {
  if (result.status === 'failed') {
    return `failed:${result.reason}`;
  }

  return result.status;
};

const MediaNotes = () => {
  const [captureResult, setCaptureResult] = useState<CaptureMediaResult | null>(
    null,
  );

  const handleCapture = async (mediaType: 'audio' | 'video') => {
    setCaptureResult(null);

    const result =
      mediaType === 'audio'
        ? await recordAudio({ maxDurationSeconds: 60 })
        : await recordVideo({ maxDurationSeconds: 60 });

    setCaptureResult(result);
  };

  return (
    <div
      data-testid={MEDIA_NOTES_TEST_IDS.root}
      style={{ fontFamily: 'sans-serif', padding: '16px' }}
    >
      <h3 style={{ fontSize: '15px', margin: '0 0 12px' }}>Media notes</h3>
      <p style={{ color: '#555', fontSize: '13px', margin: '0 0 16px' }}>
        Record a note with your microphone or camera. The recording is stored
        as a file in Twenty and playable below.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <button
          data-testid={MEDIA_NOTES_TEST_IDS.recordAudioButton}
          style={buttonStyle}
          onClick={() => handleCapture('audio')}
        >
          Record a voice note
        </button>
        <button
          data-testid={MEDIA_NOTES_TEST_IDS.recordVideoButton}
          style={buttonStyle}
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
