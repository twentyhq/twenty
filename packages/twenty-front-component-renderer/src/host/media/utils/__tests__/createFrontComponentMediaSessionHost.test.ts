import { createFrontComponentMediaSessionHost } from '../createFrontComponentMediaSessionHost';

type DeferredStream = {
  resolve: (stream: unknown) => void;
  reject: (error: Error) => void;
};

const createFakeTrack = (kind: 'audio' | 'video' = 'audio') => {
  const track = {
    id: `track-${kind}`,
    kind,
    readyState: 'live',
    stop: jest.fn(),
    addEventListener: jest.fn(),
  };

  track.stop.mockImplementation(() => {
    track.readyState = 'ended';
  });

  return track;
};

const createFakeStream = (kinds: ('audio' | 'video')[] = ['audio']) => {
  const tracks = kinds.map((kind) => createFakeTrack(kind));

  return { getTracks: () => tracks };
};

const installGetUserMediaMock = () => {
  const pendingStarts: DeferredStream[] = [];

  const getUserMedia = jest.fn(
    () =>
      new Promise((resolve, reject) => {
        pendingStarts.push({ resolve, reject });
      }),
  );

  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });

  return { pendingStarts };
};

const createPermittedHost = () =>
  createFrontComponentMediaSessionHost({ beforeStartStream: () => null });

const waitForMediaStart = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('createFrontComponentMediaSessionHost', () => {
  it('should deny capture when no host policy is provided', async () => {
    const getUserMedia = jest.fn().mockResolvedValue(createFakeStream());
    const onPendingStartChange = jest.fn();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const host = createFrontComponentMediaSessionHost({
      onPendingStartChange,
    });

    const result = await host.mediaStartStream({
      audio: true,
      video: false,
    });

    expect(result.status).toBe('failed');
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(onPendingStartChange).not.toHaveBeenCalled();

    const permittedHost = createPermittedHost();

    await expect(
      permittedHost.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    permittedHost.stopAllSessions();
  });

  it('should reject overlapping captures within the same host', async () => {
    const { pendingStarts } = installGetUserMediaMock();

    const firstHost = createPermittedHost();
    const firstStartPromise = firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    const rejectedWhilePending = await firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    expect(rejectedWhilePending.status).toBe('failed');
    expect(
      rejectedWhilePending.status === 'failed' &&
        rejectedWhilePending.errorName,
    ).toBe('NotReadableError');

    await waitForMediaStart();
    pendingStarts[0].resolve(createFakeStream());

    const firstStartResult = await firstStartPromise;

    expect(firstStartResult.status).toBe('started');

    const rejectedWhileLive = await firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    expect(rejectedWhileLive.status).toBe('failed');

    firstHost.stopAllSessions();

    const secondStartPromise = firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    await waitForMediaStart();
    pendingStarts[1].resolve(createFakeStream());

    const secondStartResult = await secondStartPromise;

    expect(secondStartResult.status).toBe('started');

    firstHost.stopAllSessions();
  });

  it('should allow independent captures across hosts and stop only the selected host', async () => {
    const { pendingStarts } = installGetUserMediaMock();
    const firstHost = createPermittedHost();
    const secondHost = createPermittedHost();
    const firstStream = createFakeStream();
    const secondStream = createFakeStream();

    try {
      const firstStartPromise = firstHost.mediaStartStream({
        audio: true,
        video: false,
      });
      const secondStartPromise = secondHost.mediaStartStream({
        audio: true,
        video: false,
      });

      await waitForMediaStart();
      expect(pendingStarts).toHaveLength(2);
      pendingStarts[0].resolve(firstStream);
      pendingStarts[1].resolve(secondStream);

      await expect(firstStartPromise).resolves.toMatchObject({
        status: 'started',
      });
      await expect(secondStartPromise).resolves.toMatchObject({
        status: 'started',
      });

      firstHost.stopAllSessions();

      expect(firstStream.getTracks()[0].stop).toHaveBeenCalledTimes(1);
      expect(secondStream.getTracks()[0].stop).not.toHaveBeenCalled();
      expect(secondStream.getTracks()[0].readyState).toBe('live');

      const restartPromise = firstHost.mediaStartStream({
        audio: true,
        video: false,
      });

      await waitForMediaStart();
      pendingStarts[2].resolve(createFakeStream());

      await expect(restartPromise).resolves.toMatchObject({
        status: 'started',
      });
    } finally {
      firstHost.stopAllSessions();
      secondHost.stopAllSessions();
    }
  });

  it('should allow another host to capture while its policy is pending', async () => {
    const { pendingStarts } = installGetUserMediaMock();
    const firstHost = createFrontComponentMediaSessionHost({
      beforeStartStream: () => new Promise(() => undefined),
    });
    const secondHost = createPermittedHost();

    try {
      const firstStartPromise = firstHost.mediaStartStream({
        audio: true,
        video: false,
      });
      const secondStartPromise = secondHost.mediaStartStream({
        audio: true,
        video: false,
      });

      await waitForMediaStart();
      expect(pendingStarts).toHaveLength(1);
      pendingStarts[0].resolve(createFakeStream());

      await expect(secondStartPromise).resolves.toMatchObject({
        status: 'started',
      });

      firstHost.stopAllSessions();

      await expect(firstStartPromise).resolves.toMatchObject({
        status: 'failed',
        errorName: 'AbortError',
      });
    } finally {
      firstHost.stopAllSessions();
      secondHost.stopAllSessions();
    }
  });

  it('should keep another host unauthorized while an approved host is capturing', async () => {
    const { pendingStarts } = installGetUserMediaMock();
    const permittedHost = createPermittedHost();
    const deniedHost = createFrontComponentMediaSessionHost({
      beforeStartStream: () => ({
        errorName: 'NotAllowedError',
        errorMessage: 'This application does not have microphone access',
      }),
    });
    const permittedStream = createFakeStream();

    try {
      const permittedStartPromise = permittedHost.mediaStartStream({
        audio: true,
        video: false,
      });

      await waitForMediaStart();
      pendingStarts[0].resolve(permittedStream);
      await expect(permittedStartPromise).resolves.toMatchObject({
        status: 'started',
      });

      await expect(
        deniedHost.mediaStartStream({ audio: true, video: false }),
      ).resolves.toMatchObject({
        status: 'failed',
        errorName: 'NotAllowedError',
      });
      expect(pendingStarts).toHaveLength(1);
      expect(permittedStream.getTracks()[0].stop).not.toHaveBeenCalled();
    } finally {
      permittedHost.stopAllSessions();
      deniedHost.stopAllSessions();
    }
  });

  it('should free the slot when a start fails', async () => {
    const { pendingStarts } = installGetUserMediaMock();

    const host = createPermittedHost();

    const failingStartPromise = host.mediaStartStream({
      audio: true,
      video: false,
    });

    await waitForMediaStart();
    pendingStarts[0].reject(
      Object.assign(new Error('Permission denied'), {
        name: 'NotAllowedError',
      }),
    );

    const failedResult = await failingStartPromise;

    expect(failedResult.status).toBe('failed');
    expect(failedResult.status === 'failed' && failedResult.errorName).toBe(
      'NotAllowedError',
    );

    const retryPromise = host.mediaStartStream({ audio: true, video: false });

    await waitForMediaStart();
    pendingStarts[1].resolve(createFakeStream());

    const retryResult = await retryPromise;

    expect(retryResult.status).toBe('started');

    host.stopAllSessions();
  });

  it('should cancel a pending start without cancelling another host', async () => {
    const { pendingStarts } = installGetUserMediaMock();

    const firstHost = createPermittedHost();
    const secondHost = createPermittedHost();

    const firstStartPromise = firstHost.mediaStartStream({
      audio: true,
      video: false,
    });
    const secondStartPromise = secondHost.mediaStartStream({
      audio: true,
      video: false,
    });

    await waitForMediaStart();
    firstHost.stopAllSessions();

    const firstStartResult = await firstStartPromise;

    expect(firstStartResult.status).toBe('failed');
    expect(
      firstStartResult.status === 'failed' && firstStartResult.errorName,
    ).toBe('AbortError');

    const secondStream = createFakeStream();

    pendingStarts[1].resolve(secondStream);

    const secondStartResult = await secondStartPromise;

    expect(secondStartResult.status).toBe('started');

    const lateStream = createFakeStream();

    pendingStarts[0].resolve(lateStream);
    await waitForMediaStart();

    expect(lateStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(secondStream.getTracks()[0].stop).not.toHaveBeenCalled();

    secondHost.stopAllSessions();
  });

  it('should cancel a pending host approval without invoking browser capture', async () => {
    const getUserMedia = jest.fn();
    const firstHost = createFrontComponentMediaSessionHost({
      beforeStartStream: () => new Promise(() => undefined),
    });
    const secondHost = createPermittedHost();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const firstStartPromise = firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    await waitForMediaStart();
    firstHost.stopAllSessions();

    await expect(firstStartPromise).resolves.toMatchObject({
      status: 'failed',
      errorName: 'AbortError',
    });
    expect(getUserMedia).not.toHaveBeenCalled();

    getUserMedia.mockResolvedValue(createFakeStream());

    await expect(
      secondHost.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    secondHost.stopAllSessions();
  });

  it('should time out a pending start without stopping another host', async () => {
    jest.useFakeTimers();

    const { pendingStarts } = installGetUserMediaMock();
    const firstHost = createPermittedHost();
    const secondHost = createPermittedHost();

    try {
      const firstStartPromise = firstHost.mediaStartStream({
        audio: true,
        video: false,
      });
      const secondStartPromise = secondHost.mediaStartStream({
        audio: true,
        video: false,
      });
      const secondStream = createFakeStream();

      await waitForMediaStart();
      pendingStarts[1].resolve(secondStream);

      await expect(secondStartPromise).resolves.toMatchObject({
        status: 'started',
      });

      jest.advanceTimersByTime(60_000);

      await expect(firstStartPromise).resolves.toMatchObject({
        status: 'failed',
        errorName: 'TimeoutError',
      });

      const lateStream = createFakeStream();

      pendingStarts[0].resolve(lateStream);
      await waitForMediaStart();

      expect(lateStream.getTracks()[0].stop).toHaveBeenCalled();
      expect(secondStream.getTracks()[0].stop).not.toHaveBeenCalled();
    } finally {
      firstHost.stopAllSessions();
      secondHost.stopAllSessions();
      jest.useRealTimers();
    }
  });
  it('should return a failure instead of rejecting when getUserMedia is unavailable', async () => {
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {},
    });

    await expect(
      createPermittedHost().mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'failed', errorName: 'TypeError' });
  });

  it('should not surface a pending-start listener failure to the caller', async () => {
    const getUserMedia = jest.fn().mockResolvedValue(createFakeStream());

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    const host = createFrontComponentMediaSessionHost({
      beforeStartStream: () => null,
      onPendingStartChange: () => {
        throw new Error('The listener failed to render the pending state');
      },
    });

    await expect(
      host.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    host.stopAllSessions();

    await expect(
      host.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    host.stopAllSessions();
  });

  it('should report only the media types whose tracks are still live', async () => {
    const stream = createFakeStream(['audio', 'video']);
    const onActiveSessionsChange = jest.fn();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: jest.fn().mockResolvedValue(stream) },
    });

    const host = createFrontComponentMediaSessionHost({
      beforeStartStream: () => null,
      onActiveSessionsChange,
    });
    const startResult = await host.mediaStartStream({
      audio: true,
      video: true,
    });

    expect(onActiveSessionsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ mediaTypes: ['audio', 'video'] }),
    ]);

    if (startResult.status !== 'started') {
      throw new Error('Expected the capture to start');
    }

    await host.mediaStopStreamTrack({
      streamId: startResult.streamId,
      trackId: 'track-video',
    });

    expect(onActiveSessionsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ mediaTypes: ['audio'] }),
    ]);

    host.stopAllSessions();
  });
  it('should register and keep stopping a capture when a listener throws', async () => {
    const stream = createFakeStream();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: jest.fn().mockResolvedValue(stream) },
    });

    const host = createFrontComponentMediaSessionHost({
      beforeStartStream: () => null,
      onPendingStartChange: () => {
        throw new Error('The listener failed to render the pending state');
      },
      onActiveSessionsChange: () => {
        throw new Error('The listener failed to render the active sessions');
      },
    });

    await expect(
      host.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    host.stopAllSessions();

    expect(stream.getTracks()[0].stop).toHaveBeenCalled();

    await expect(
      host.mediaStartStream({ audio: true, video: false }),
    ).resolves.toMatchObject({ status: 'started' });

    host.stopAllSessions();
  });
});
