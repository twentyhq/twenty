import { type MediaSessionHostFunctions } from '@/types/MediaSession';
import { createWorkerMediaBridge } from '../createWorkerMediaBridge';
import { installMediaCapturePolyfills } from '../installMediaCapturePolyfills';

type MediaGlobals = {
  navigator: {
    mediaDevices: {
      getUserMedia: (constraints?: unknown) => Promise<MediaStreamLike>;
    };
  };
  MediaStream: new (streamOrTracks?: unknown) => MediaStreamLike;
  MediaStreamTrack: new () => unknown;
  MediaRecorder: (new (
    stream: MediaStreamLike,
    options?: { mimeType?: string },
  ) => MediaRecorderLike) & { isTypeSupported: (mimeType: string) => boolean };
};

type MediaStreamTrackLike = EventTarget & {
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

type MediaRecorderLike = EventTarget & {
  state: string;
  mimeType: string;
  start: (timesliceMs?: number) => void;
  stop: () => void;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstart: (() => void) | null;
  onstop: (() => void) | null;
  onerror: ((event: { error: Error }) => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
};

const MEDIA_RECORDER_EVENT_TYPES = [
  'dataavailable',
  'start',
  'stop',
  'error',
  'pause',
  'resume',
] as const;

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

const createMediaRecorder = async () => {
  const { mediaGlobals } = installOnFreshScope(createTransportStub());
  const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  return new mediaGlobals.MediaRecorder(mediaStream);
};

const createMediaStreamTrack = async () => {
  const { mediaGlobals } = installOnFreshScope(createTransportStub());
  const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const [track] = mediaStream.getTracks();

  return track;
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

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

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

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });
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

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

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

    // A macrotask drains the start acknowledgement's await boundaries.
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

  it('should ignore stale host events after the recorder restarts', async () => {
    const transport = createTransportStub();
    let recorderCounter = 0;
    transport.mediaStartRecorder = jest.fn(async () => ({
      status: 'started' as const,
      recorderId: `recorder-${recorderCounter++}`,
      mimeType: 'audio/webm',
    }));

    const { bridge, mediaGlobals } = installOnFreshScope(transport);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new mediaGlobals.MediaRecorder(mediaStream);
    const stopHandler = jest.fn();
    mediaRecorder.onstop = stopHandler;

    mediaRecorder.start();
    await new Promise((resolve) => setTimeout(resolve, 0));

    mediaRecorder.stop();
    mediaRecorder.start();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mediaRecorder.state).toBe('recording');

    bridge.dispatchEvents({
      events: [{ type: 'recorder-stop', recorderId: 'recorder-0' }],
    });

    expect(mediaRecorder.state).toBe('recording');

    bridge.dispatchEvents({
      events: [{ type: 'recorder-stop', recorderId: 'recorder-1' }],
    });

    expect(mediaRecorder.state).toBe('inactive');
    expect(stopHandler).toHaveBeenCalledTimes(1);
  });

  it('should fire error and then stop when the host cannot start the recorder', async () => {
    const transport = createTransportStub();
    transport.mediaStartRecorder = jest.fn(async () => ({
      status: 'failed' as const,
      errorName: 'NotReadableError',
      errorMessage: 'The recorder could not start',
    }));

    const { mediaGlobals } = installOnFreshScope(transport);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new mediaGlobals.MediaRecorder(mediaStream);

    const errorHandler = jest.fn();
    const stopHandler = jest.fn();

    mediaRecorder.onerror = errorHandler;
    mediaRecorder.onstop = stopHandler;

    mediaRecorder.start();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0].error.name).toBe('NotReadableError');
    // Native recorders fire stop after error, so callers waiting on it never hang.
    expect(stopHandler).toHaveBeenCalledTimes(1);
    expect(mediaRecorder.state).toBe('inactive');
  });

  it('should throw for recorder construction on foreign values and unsupported types', async () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    expect(
      () =>
        new mediaGlobals.MediaRecorder({
          id: 'not-a-stream',
        } as unknown as MediaStreamLike),
    ).toThrow(TypeError);

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    expect(
      () =>
        new mediaGlobals.MediaRecorder(mediaStream, {
          mimeType: 'video/unsupported',
        }),
    ).toThrow(expect.objectContaining({ name: 'NotSupportedError' }));
  });

  it('should refuse to start a recorder on an inactive stream', async () => {
    const { mediaGlobals } = installOnFreshScope(createTransportStub());

    const mediaStream = await mediaGlobals.navigator.mediaDevices.getUserMedia({
      audio: true,
    });

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

  describe.each(MEDIA_RECORDER_EVENT_TYPES)(
    'MediaRecorder on%s',
    (eventType) => {
      const handlerName = `on${eventType}` as const;

      it('should keep a listener that shares its callback with the handler', async () => {
        const mediaRecorder = await createMediaRecorder();
        const handler = jest.fn();

        mediaRecorder[handlerName] = handler;
        mediaRecorder.addEventListener(eventType, handler);
        mediaRecorder.dispatchEvent(new Event(eventType));

        expect(handler).toHaveBeenCalledTimes(2);

        mediaRecorder[handlerName] = null;
        mediaRecorder.dispatchEvent(new Event(eventType));

        expect(handler).toHaveBeenCalledTimes(3);
      });

      it('should keep the handler active when its callback is removed as a listener', async () => {
        const mediaRecorder = await createMediaRecorder();
        const handler = jest.fn();

        mediaRecorder[handlerName] = handler;
        mediaRecorder.removeEventListener(eventType, handler);
        mediaRecorder.dispatchEvent(new Event(eventType));

        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('should keep a replaced handler in its listener position until it is cleared', async () => {
        const mediaRecorder = await createMediaRecorder();
        const calls: string[] = [];

        mediaRecorder[handlerName] = () => calls.push('first');
        mediaRecorder.addEventListener(eventType, () => calls.push('second'));
        mediaRecorder[handlerName] = () => calls.push('third');
        mediaRecorder.dispatchEvent(new Event(eventType));

        mediaRecorder[handlerName] = null;
        mediaRecorder[handlerName] = () => calls.push('fourth');
        mediaRecorder.dispatchEvent(new Event(eventType));

        expect(calls).toEqual(['third', 'second', 'second', 'fourth']);
      });
    },
  );

  describe('MediaStreamTrack onended', () => {
    it('should keep a listener that shares its callback with the handler', async () => {
      const track = await createMediaStreamTrack();
      const endedHandler = jest.fn();

      track.onended = endedHandler;
      track.addEventListener('ended', endedHandler);
      track.dispatchEvent(new Event('ended'));

      expect(endedHandler).toHaveBeenCalledTimes(2);

      track.onended = null;
      track.dispatchEvent(new Event('ended'));

      expect(endedHandler).toHaveBeenCalledTimes(3);
    });

    it('should keep the handler active when its callback is removed as a listener', async () => {
      const track = await createMediaStreamTrack();
      const endedHandler = jest.fn();

      track.onended = endedHandler;
      track.removeEventListener('ended', endedHandler);
      track.dispatchEvent(new Event('ended'));

      expect(endedHandler).toHaveBeenCalledTimes(1);
    });

    it('should keep a replaced handler in its listener position until it is cleared', async () => {
      const track = await createMediaStreamTrack();
      const calls: string[] = [];

      track.onended = () => calls.push('first');
      track.addEventListener('ended', () => calls.push('second'));
      track.onended = () => calls.push('third');
      track.dispatchEvent(new Event('ended'));

      track.onended = null;
      track.onended = () => calls.push('fourth');
      track.dispatchEvent(new Event('ended'));

      expect(calls).toEqual(['third', 'second', 'second', 'fourth']);
    });
  });
});
