import { type MediaSessionHostFunctions } from '@/types/MediaSession';
import { createWorkerMediaBridge } from '../createWorkerMediaBridge';
import { installMediaCapturePolyfills } from '../installMediaCapturePolyfills';

type MediaGlobals = {
  navigator: { mediaDevices: { getUserMedia: (constraints?: unknown) => Promise<MediaStreamLike> } };
  MediaStream: new (streamOrTracks?: unknown) => MediaStreamLike;
  MediaStreamTrack: new () => unknown;
  MediaRecorder: (new (
    stream: MediaStreamLike,
    options?: { mimeType?: string },
  ) => MediaRecorderLike) & { isTypeSupported: (mimeType: string) => boolean };
};

type MediaStreamTrackLike = {
  id: string;
  kind: string;
  readyState: string;
  enabled: boolean;
  onended: (() => void) | null;
  stop: () => void;
};

type MediaStreamLike = {
  id: string;
  active: boolean;
  getTracks: () => MediaStreamTrackLike[];
};

type MediaRecorderLike = {
  state: string;
  mimeType: string;
  start: (timesliceMs?: number) => void;
  stop: () => void;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstart: (() => void) | null;
  onstop: (() => void) | null;
  onerror: ((event: { error: Error }) => void) | null;
};

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
    mimeType: 'audio/webm;codecs=opus',
  })),
  mediaStopRecorder: jest.fn(async () => {}),
  mediaPauseRecorder: jest.fn(async () => {}),
  mediaResumeRecorder: jest.fn(async () => {}),
  mediaRequestRecorderData: jest.fn(async () => {}),
});

const installOnFreshScope = (transport: MediaSessionHostFunctions) => {
  const bridge = createWorkerMediaBridge();
  bridge.connectTransport(transport);
  bridge.seedRecorderCapabilities({ supportedMimeTypes: ['audio/webm'] });

  const globalScope: Record<string, unknown> = {};
  installMediaCapturePolyfills({ globalScope, bridge });

  return { bridge, mediaGlobals: globalScope as unknown as MediaGlobals };
};

describe('installMediaCapturePolyfills', () => {
  it('should install the media globals and navigator.mediaDevices', () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    expect(typeof mediaGlobals.MediaStream).toBe('function');
    expect(typeof mediaGlobals.MediaStreamTrack).toBe('function');
    expect(typeof mediaGlobals.MediaRecorder).toBe('function');
    expect(typeof mediaGlobals.navigator.mediaDevices.getUserMedia).toBe(
      'function',
    );
  });

  it('should reject getUserMedia without audio or video', async () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    await expect(
      mediaGlobals.navigator.mediaDevices.getUserMedia({}),
    ).rejects.toThrow(TypeError);
  });

  it('should reject getUserMedia with the host failure as a named error', async () => {
    const transport = createTransportStub();
    transport.mediaStartStream = jest.fn(async () => ({
      status: 'failed' as const,
      errorName: 'NotAllowedError',
      errorMessage: 'Permission denied',
    }));

    const { mediaGlobals } = installOnFreshScope(transport);

    await expect(
      mediaGlobals.navigator.mediaDevices.getUserMedia({ audio: true }),
    ).rejects.toMatchObject({ name: 'NotAllowedError' });
  });

  it('should build a live stream whose tracks stop through the transport', async () => {
    const transport = createTransportStub();
    const { mediaGlobals } = installOnFreshScope(transport);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia(
      { audio: true },
    );

    expect(mediaStream.active).toBe(true);

    const [track] = mediaStream.getTracks();

    expect(track.kind).toBe('audio');
    expect(track.readyState).toBe('live');

    const endedHandler = jest.fn();
    track.onended = endedHandler;
    track.stop();

    expect(track.readyState).toBe('ended');
    expect(mediaStream.active).toBe(false);
    // Self-initiated stops fire no ended event, matching the native API.
    expect(endedHandler).not.toHaveBeenCalled();
    expect(transport.mediaStopStreamTrack).toHaveBeenCalledWith({
      streamId: 'stream-1',
      trackId: 'track-1',
    });
  });

  it('should fire ended on tracks the host reports as ended', async () => {
    const transport = createTransportStub();
    const { bridge, mediaGlobals } = installOnFreshScope(transport);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia(
      { audio: true },
    );
    const [track] = mediaStream.getTracks();

    const endedHandler = jest.fn();
    track.onended = endedHandler;

    bridge.dispatchEvents({
      events: [
        { type: 'track-ended', streamId: 'stream-1', trackId: 'track-1' },
      ],
    });

    expect(endedHandler).toHaveBeenCalledTimes(1);
    expect(track.readyState).toBe('ended');
  });

  it('should record through the transport and replay pushed chunks as events', async () => {
    const transport = createTransportStub();
    const { bridge, mediaGlobals } = installOnFreshScope(transport);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia(
      { audio: true },
    );

    const mediaRecorder = new mediaGlobals.MediaRecorder(mediaStream);

    expect(mediaRecorder.state).toBe('inactive');

    const receivedChunks: Blob[] = [];
    const startHandler = jest.fn();
    const stopHandler = jest.fn();

    mediaRecorder.ondataavailable = (event) => receivedChunks.push(event.data);
    mediaRecorder.onstart = startHandler;
    mediaRecorder.onstop = stopHandler;

    mediaRecorder.start();

    expect(mediaRecorder.state).toBe('recording');

    // The start acknowledgement crosses several await boundaries; a
    // macrotask drains them all.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(startHandler).toHaveBeenCalledTimes(1);
    expect(mediaRecorder.mimeType).toBe('audio/webm;codecs=opus');
    expect(transport.mediaStartRecorder).toHaveBeenCalledWith(
      expect.objectContaining({ streamId: 'stream-1' }),
    );

    mediaRecorder.stop();

    expect(mediaRecorder.state).toBe('inactive');
    expect(transport.mediaStopRecorder).toHaveBeenCalledWith({
      recorderId: 'recorder-1',
    });

    const recordedBlob = new Blob(['bytes']);

    bridge.dispatchEvents({
      events: [
        { type: 'recorder-data', recorderId: 'recorder-1', data: recordedBlob },
        { type: 'recorder-stop', recorderId: 'recorder-1' },
      ],
    });

    expect(receivedChunks).toEqual([recordedBlob]);
    expect(stopHandler).toHaveBeenCalledTimes(1);
  });

  it('should throw for recorder construction on foreign values and unsupported types', async () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    expect(
      () =>
        new mediaGlobals.MediaRecorder(
          { id: 'not-a-stream' } as unknown as MediaStreamLike,
        ),
    ).toThrow(TypeError);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia(
      { audio: true },
    );

    expect(
      () =>
        new mediaGlobals.MediaRecorder(mediaStream, {
          mimeType: 'video/unsupported',
        }),
    ).toThrow(expect.objectContaining({ name: 'NotSupportedError' }));
  });

  it('should refuse to start a recorder on an inactive stream', async () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia(
      { audio: true },
    );

    const mediaRecorder = new mediaGlobals.MediaRecorder(mediaStream);

    for (const track of mediaStream.getTracks()) {
      track.stop();
    }

    expect(() => mediaRecorder.start()).toThrow(
      expect.objectContaining({ name: 'InvalidStateError' }),
    );
  });

  it('should answer isTypeSupported from the seeded snapshot', () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    expect(mediaGlobals.MediaRecorder.isTypeSupported('audio/webm')).toBe(true);
    expect(mediaGlobals.MediaRecorder.isTypeSupported('video/mp4')).toBe(false);
  });
});
