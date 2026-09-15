import { createFrontComponentMediaSessionHost } from '../createFrontComponentMediaSessionHost';

type DeferredStream = {
  resolve: (stream: unknown) => void;
  reject: (error: Error) => void;
};

const createFakeTrack = () => ({
  id: `track-${Math.random().toString(36).slice(2)}`,
  kind: 'audio',
  readyState: 'live',
  stop: jest.fn(),
  addEventListener: jest.fn(),
});

const createFakeStream = () => {
  const track = createFakeTrack();

  track.stop.mockImplementation(() => {
    track.readyState = 'ended';
  });

  return { getTracks: () => [track] };
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

describe('createFrontComponentMediaSessionHost capture slot', () => {
  it('should hold one capture slot across hosts, through pending starts, live sessions, and failures', async () => {
    const { pendingStarts } = installGetUserMediaMock();

    const firstHost = createFrontComponentMediaSessionHost();
    const secondHost = createFrontComponentMediaSessionHost();

    // A start still waiting on the permission prompt already holds the slot.
    const firstStartPromise = firstHost.mediaStartStream({
      audio: true,
      video: false,
    });

    const rejectedWhilePending = await secondHost.mediaStartStream({
      audio: true,
      video: false,
    });

    expect(rejectedWhilePending.status).toBe('failed');
    expect(
      rejectedWhilePending.status === 'failed' &&
        rejectedWhilePending.errorName,
    ).toBe('NotReadableError');

    pendingStarts[0].resolve(createFakeStream());

    const firstStartResult = await firstStartPromise;

    expect(firstStartResult.status).toBe('started');

    // A live session keeps the slot held.
    const rejectedWhileLive = await secondHost.mediaStartStream({
      audio: true,
      video: false,
    });

    expect(rejectedWhileLive.status).toBe('failed');

    // Ending the session frees the slot for another host.
    firstHost.stopAllSessions();

    const secondStartPromise = secondHost.mediaStartStream({
      audio: true,
      video: false,
    });

    pendingStarts[1].resolve(createFakeStream());

    const secondStartResult = await secondStartPromise;

    expect(secondStartResult.status).toBe('started');

    secondHost.stopAllSessions();
  });

  it('should free the slot when a start fails', async () => {
    const { pendingStarts } = installGetUserMediaMock();

    const host = createFrontComponentMediaSessionHost();

    const failingStartPromise = host.mediaStartStream({
      audio: true,
      video: false,
    });

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

    pendingStarts[1].resolve(createFakeStream());

    const retryResult = await retryPromise;

    expect(retryResult.status).toBe('started');

    host.stopAllSessions();
  });
});
