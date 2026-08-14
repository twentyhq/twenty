import { type MediaSessionHostFunctions } from '@/types/MediaSession';
import { createWorkerMediaBridge } from '../createWorkerMediaBridge';

const createTransportStub = (): MediaSessionHostFunctions => ({
  mediaStartStream: jest.fn(async () => ({
    status: 'started' as const,
    streamId: 'stream-1',
    tracks: [{ trackId: 'track-1', kind: 'audio' as const }],
  })),
  mediaStopStreamTrack: jest.fn(async () => {}),
  mediaSetTrackEnabled: jest.fn(async () => {}),
  mediaStartRecorder: jest.fn(async () => ({
    status: 'started' as const,
    recorderId: 'recorder-1',
    mimeType: 'audio/webm',
  })),
  mediaStopRecorder: jest.fn(async () => {}),
  mediaPauseRecorder: jest.fn(async () => {}),
  mediaResumeRecorder: jest.fn(async () => {}),
  mediaRequestRecorderData: jest.fn(async () => {}),
});

describe('createWorkerMediaBridge', () => {
  it('should fail stream and recorder starts when no transport is connected', async () => {
    const bridge = createWorkerMediaBridge();

    const streamResult = await bridge.startStream({ mediaType: 'audio' });
    const recorderResult = await bridge.startRecorder({
      streamId: 'stream-1',
      handlers: { onData: jest.fn(), onStop: jest.fn(), onError: jest.fn() },
    });

    expect(streamResult.status).toBe('failed');
    expect(recorderResult.status).toBe('failed');
  });

  it('should forward stream starts to the transport', async () => {
    const bridge = createWorkerMediaBridge();
    const transport = createTransportStub();

    bridge.connectTransport(transport);

    const result = await bridge.startStream({ mediaType: 'video' });

    expect(transport.mediaStartStream).toHaveBeenCalledWith({
      mediaType: 'video',
    });
    expect(result.status).toBe('started');
  });

  it('should dispatch recorder events to the handlers registered at start', async () => {
    const bridge = createWorkerMediaBridge();
    bridge.connectTransport(createTransportStub());

    const onData = jest.fn();
    const onStop = jest.fn();

    await bridge.startRecorder({
      streamId: 'stream-1',
      handlers: { onData, onStop, onError: jest.fn() },
    });

    const recordedBlob = new Blob(['bytes']);

    bridge.dispatchEvents({
      events: [
        { type: 'recorder-data', recorderId: 'recorder-1', data: recordedBlob },
        { type: 'recorder-stop', recorderId: 'recorder-1' },
      ],
    });

    expect(onData).toHaveBeenCalledWith(recordedBlob);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('should stop dispatching to a recorder after its stop event', async () => {
    const bridge = createWorkerMediaBridge();
    bridge.connectTransport(createTransportStub());

    const onData = jest.fn();

    await bridge.startRecorder({
      streamId: 'stream-1',
      handlers: { onData, onStop: jest.fn(), onError: jest.fn() },
    });

    bridge.dispatchEvents({
      events: [{ type: 'recorder-stop', recorderId: 'recorder-1' }],
    });
    bridge.dispatchEvents({
      events: [
        { type: 'recorder-data', recorderId: 'recorder-1', data: new Blob() },
      ],
    });

    expect(onData).not.toHaveBeenCalled();
  });

  it('should dispatch track endings once and drop the registration', () => {
    const bridge = createWorkerMediaBridge();
    const onEnded = jest.fn();

    bridge.registerTrackEventHandlers({
      streamId: 'stream-1',
      trackId: 'track-1',
      handlers: { onEnded },
    });

    const trackEndedBatch = {
      events: [
        {
          type: 'track-ended' as const,
          streamId: 'stream-1',
          trackId: 'track-1',
        },
      ],
    };

    bridge.dispatchEvents(trackEndedBatch);
    bridge.dispatchEvents(trackEndedBatch);

    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch track endings after a self-initiated stop', () => {
    const bridge = createWorkerMediaBridge();
    bridge.connectTransport(createTransportStub());

    const onEnded = jest.fn();

    bridge.registerTrackEventHandlers({
      streamId: 'stream-1',
      trackId: 'track-1',
      handlers: { onEnded },
    });

    bridge.stopStreamTrack({ streamId: 'stream-1', trackId: 'track-1' });

    bridge.dispatchEvents({
      events: [
        { type: 'track-ended', streamId: 'stream-1', trackId: 'track-1' },
      ],
    });

    expect(onEnded).not.toHaveBeenCalled();
  });

  it('should answer isTypeSupported from the seeded snapshot', () => {
    const bridge = createWorkerMediaBridge();

    bridge.seedRecorderCapabilities({
      supportedMimeTypes: ['audio/webm;codecs=opus'],
    });

    expect(bridge.isRecorderMimeTypeSupported('')).toBe(true);
    expect(bridge.isRecorderMimeTypeSupported('audio/webm;codecs=opus')).toBe(
      true,
    );
    expect(bridge.isRecorderMimeTypeSupported('AUDIO/WEBM;CODECS=OPUS')).toBe(
      true,
    );
    expect(bridge.isRecorderMimeTypeSupported('video/mp4')).toBe(false);
  });
});
