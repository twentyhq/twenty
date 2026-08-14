import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  type RecordedMediaFile,
  type StopMediaRecordingResult,
  cancelRecording,
  startAudioRecording,
  startVideoRecording,
  stopRecording,
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

const OBJECTS_PAGE_SIZE = 100;

type ObjectsPage = {
  fields: { id: string; universalIdentifier: string | null }[];
  nextCursor: string | null;
};

const fetchObjectsPage = async (after: string | null): Promise<ObjectsPage> => {
  const result = await new MetadataApiClient().query({
    objects: {
      __args: {
        paging: { first: OBJECTS_PAGE_SIZE, ...(after ? { after } : {}) },
        filter: {},
      },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: { fieldsList: { id: true, universalIdentifier: true } },
      },
    },
  });

  const pageInfo = result.objects.pageInfo;

  return {
    fields: result.objects.edges.flatMap((edge) => edge.node.fieldsList ?? []),
    nextCursor:
      pageInfo.hasNextPage === true ? (pageInfo.endCursor ?? null) : null,
  };
};

// An app declares its fields by universalIdentifier; the per-instance
// fieldMetadataId the recording upload needs is resolved at runtime. The
// metadata API cannot filter on universalIdentifier, so page through the
// object list until the field turns up.
const fetchRecordingFieldMetadataId = async (): Promise<string | null> => {
  let cursor: string | null = null;

  for (;;) {
    const page: ObjectsPage = await fetchObjectsPage(cursor);

    const recordingField = page.fields.find(
      (field) =>
        field.universalIdentifier === RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
    );

    if (recordingField) {
      return recordingField.id;
    }

    if (page.nextCursor === null) {
      return null;
    }

    cursor = page.nextCursor;
  }
};

const describeResult = (result: StopMediaRecordingResult): string =>
  result.status === 'failed' ? `failed:${result.reason}` : result.status;

type PendingAttach = {
  mediaType: 'audio' | 'video';
  file: RecordedMediaFile;
};

type ActiveRecording = {
  recordingId: string;
  mediaType: 'audio' | 'video';
  startedAt: number;
};

const MediaNotes = () => {
  const [recordingFieldMetadataId, setRecordingFieldMetadataId] = useState<
    string | null
  >(null);
  const [captureResult, setCaptureResult] =
    useState<StopMediaRecordingResult | null>(null);
  const [activeRecording, setActiveRecording] =
    useState<ActiveRecording | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  // Set only when attaching failed, so it doubles as the retry payload.
  const [failedAttach, setFailedAttach] = useState<PendingAttach | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  // Covers the stop-and-upload window: without it the record buttons come
  // back while the previous recording is still uploading, and two flows race.
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    fetchRecordingFieldMetadataId()
      .then(setRecordingFieldMetadataId)
      .catch(() => setRecordingFieldMetadataId(null));
  }, []);

  // The recording UX is the app's own: this timer is rendered and styled
  // here, not by a host modal. The host only shows its recording indicator.
  useEffect(() => {
    if (activeRecording === null) {
      return;
    }

    setElapsedSeconds(0);

    const elapsedInterval = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - activeRecording.startedAt) / 1000),
      );
    }, 1000);

    return () => clearInterval(elapsedInterval);
  }, [activeRecording]);

  // Attaching the uploaded file to a record is what makes it permanent: until
  // then it is a temporary file owned by the FILES field, so a failure here
  // has to be recoverable rather than silent.
  const attachToNewMediaNote = async (pendingAttach: PendingAttach) => {
    setFailedAttach(null);
    setIsAttaching(true);

    try {
      const created = await new CoreApiClient().mutation({
        createMediaNote: {
          __args: {
            data: {
              title: `${pendingAttach.mediaType} note`,
              recording: [
                {
                  fileId: pendingAttach.file.fileId,
                  label: pendingAttach.file.path,
                },
              ],
            },
          },
          id: true,
        },
      });

      setSavedRecordId(created.createMediaNote?.id ?? null);
    } catch {
      setFailedAttach(pendingAttach);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleStartRecording = async (mediaType: 'audio' | 'video') => {
    // Starting a new recording mid-attach would let the in-flight attach
    // settle against a recording the UI has already replaced, offering a
    // retry for the wrong file.
    if (
      recordingFieldMetadataId === null ||
      isAttaching ||
      isStopping ||
      activeRecording !== null
    ) {
      return;
    }

    setCaptureResult(null);
    setSavedRecordId(null);
    setFailedAttach(null);

    const params = {
      fieldMetadataId: recordingFieldMetadataId,
      maxDurationSeconds: 60,
    };

    const startResult =
      mediaType === 'audio'
        ? await startAudioRecording(params)
        : await startVideoRecording(params);

    if (startResult.status === 'failed') {
      setCaptureResult(startResult);

      return;
    }

    setActiveRecording({
      recordingId: startResult.recordingId,
      mediaType,
      startedAt: Date.now(),
    });
  };

  const handleStopRecording = async () => {
    if (activeRecording === null) {
      return;
    }

    const { recordingId, mediaType } = activeRecording;

    setActiveRecording(null);
    setIsStopping(true);

    try {
      const result = await stopRecording({ recordingId });

      setCaptureResult(result);

      if (result.status !== 'captured') {
        return;
      }

      await attachToNewMediaNote({ mediaType, file: result.file });
    } finally {
      setIsStopping(false);
    }
  };

  const handleCancelRecording = async () => {
    if (activeRecording === null) {
      return;
    }

    const { recordingId } = activeRecording;

    setActiveRecording(null);

    await cancelRecording({ recordingId });
    setCaptureResult({ status: 'cancelled' });
  };

  return (
    <div
      data-testid={MEDIA_NOTES_TEST_IDS.root}
      style={{ fontFamily: 'sans-serif', padding: '16px' }}
    >
      <h3 style={{ fontSize: '15px', margin: '0 0 12px' }}>Media notes</h3>
      <p style={{ color: '#555', fontSize: '13px', margin: '0 0 16px' }}>
        Record a note with your microphone or camera. The recording is stored in
        Twenty and attached to a Media note record.
      </p>

      {activeRecording === null ? (
        <div style={{ marginBottom: '16px' }}>
          <button
            data-testid={MEDIA_NOTES_TEST_IDS.recordAudioButton}
            style={buttonStyle}
            disabled={
              recordingFieldMetadataId === null || isAttaching || isStopping
            }
            onClick={() => handleStartRecording('audio')}
          >
            Record a voice note
          </button>
          <button
            data-testid={MEDIA_NOTES_TEST_IDS.recordVideoButton}
            style={buttonStyle}
            disabled={
              recordingFieldMetadataId === null || isAttaching || isStopping
            }
            onClick={() => handleStartRecording('video')}
          >
            Record a video note
          </button>
        </div>
      ) : (
        <div style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span
            style={{
              backgroundColor: '#b42318',
              borderRadius: '50%',
              display: 'inline-block',
              height: '10px',
              width: '10px',
            }}
          />
          <span
            data-testid={MEDIA_NOTES_TEST_IDS.recordingTimer}
            style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}
          >
            Recording {activeRecording.mediaType}… {elapsedSeconds}s
          </span>
          <button
            data-testid={MEDIA_NOTES_TEST_IDS.stopRecordingButton}
            style={buttonStyle}
            onClick={handleStopRecording}
          >
            Stop and save
          </button>
          <button
            data-testid={MEDIA_NOTES_TEST_IDS.cancelRecordingButton}
            style={{ ...buttonStyle, backgroundColor: '#666' }}
            onClick={handleCancelRecording}
          >
            Cancel
          </button>
        </div>
      )}

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
          {failedAttach !== null && (
            <div
              data-testid={MEDIA_NOTES_TEST_IDS.attachError}
              style={{ color: '#b42318', margin: '8px 0 0' }}
            >
              <p style={{ margin: '0 0 8px' }}>
                The recording was uploaded but could not be attached to a media
                note. It stays temporary until it is attached.
              </p>
              <button
                data-testid={MEDIA_NOTES_TEST_IDS.retryAttachButton}
                style={buttonStyle}
                disabled={isAttaching}
                onClick={() => attachToNewMediaNote(failedAttach)}
              >
                Retry attaching
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MEDIA_NOTES_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'media-notes-component',
  description: 'Record audio or video notes with the media recording API',
  component: MediaNotes,
});
