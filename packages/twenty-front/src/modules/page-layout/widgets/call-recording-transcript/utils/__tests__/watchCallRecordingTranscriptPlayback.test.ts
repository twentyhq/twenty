import { watchCallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptPlayback';

class FakeVideoElement extends EventTarget {
  currentTime = 0;
  paused = true;
  seeking = false;
  playbackRate = 1;
}

const TIME_POINTS = [
  { startSeconds: 1, index: 0 },
  { startSeconds: 2, index: 1 },
  { startSeconds: 10, index: 2 },
];

const BOUNDED_TIME_POINTS = [
  { startSeconds: 1, endSeconds: 2, index: 0 },
  { startSeconds: 4, endSeconds: 5, index: 1 },
];

describe('watchCallRecordingTranscriptPlayback', () => {
  let fakeVideoElement: FakeVideoElement;
  let onPlaybackPositionChange: jest.Mock;

  const startWatching = (timePoints = TIME_POINTS) =>
    watchCallRecordingTranscriptPlayback({
      videoElement: fakeVideoElement,
      timePoints,
      onPlaybackPositionChange,
    });

  beforeEach(() => {
    jest.useFakeTimers();
    fakeVideoElement = new FakeVideoElement();
    onPlaybackPositionChange = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should notify the current index immediately on start', () => {
    fakeVideoElement.currentTime = 5;

    const stopWatching = startWatching();

    expect(onPlaybackPositionChange).toHaveBeenCalledTimes(1);
    expect(onPlaybackPositionChange).toHaveBeenCalledWith({
      activeIndex: 1,
      lastStartedIndex: 1,
    });

    stopWatching();
  });

  it('should notify -1 before the first point starts', () => {
    const stopWatching = startWatching();

    expect(onPlaybackPositionChange).toHaveBeenCalledWith({
      activeIndex: -1,
      lastStartedIndex: -1,
    });

    stopWatching();
  });

  it('should notify -1 after the current point ends', () => {
    fakeVideoElement.currentTime = 3;

    const stopWatching = startWatching(BOUNDED_TIME_POINTS);

    expect(onPlaybackPositionChange).toHaveBeenCalledWith({
      activeIndex: -1,
      lastStartedIndex: 0,
    });

    stopWatching();
  });

  it('should not notify again when the index is unchanged', () => {
    fakeVideoElement.currentTime = 5;

    const stopWatching = startWatching();

    fakeVideoElement.currentTime = 6;
    fakeVideoElement.dispatchEvent(new Event('timeupdate'));

    expect(onPlaybackPositionChange).toHaveBeenCalledTimes(1);

    stopWatching();
  });

  it('should follow a backward seek', () => {
    fakeVideoElement.currentTime = 5;

    const stopWatching = startWatching();

    fakeVideoElement.currentTime = 1.5;
    fakeVideoElement.dispatchEvent(new Event('seeked'));

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 0,
      lastStartedIndex: 0,
    });

    stopWatching();
  });

  it('should cross the next boundary between timeupdate events while playing', () => {
    fakeVideoElement.currentTime = 1.5;
    fakeVideoElement.paused = false;

    const stopWatching = startWatching();

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 0,
      lastStartedIndex: 0,
    });

    fakeVideoElement.currentTime = 2.1;
    jest.advanceTimersByTime(600);

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 1,
      lastStartedIndex: 1,
    });

    stopWatching();
  });

  it('should clear the current index at its end boundary while playing', () => {
    fakeVideoElement.currentTime = 1.5;
    fakeVideoElement.paused = false;

    const stopWatching = startWatching(BOUNDED_TIME_POINTS);

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 0,
      lastStartedIndex: 0,
    });

    fakeVideoElement.currentTime = 2.1;
    jest.advanceTimersByTime(600);

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: -1,
      lastStartedIndex: 0,
    });

    stopWatching();
  });

  it('should schedule the boundary wake-up against the playback rate', () => {
    fakeVideoElement.currentTime = 1.5;
    fakeVideoElement.paused = false;
    fakeVideoElement.playbackRate = 2;

    const stopWatching = startWatching();

    fakeVideoElement.currentTime = 2.1;
    jest.advanceTimersByTime(300);

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 1,
      lastStartedIndex: 1,
    });

    stopWatching();
  });

  it('should not schedule a boundary wake-up while paused', () => {
    fakeVideoElement.currentTime = 1.5;

    const stopWatching = startWatching();

    expect(jest.getTimerCount()).toBe(0);

    stopWatching();
  });

  it.each([
    { bufferingEventName: 'waiting', resumeEventName: 'playing' },
    { bufferingEventName: 'stalled', resumeEventName: 'canplay' },
  ])(
    'should suspend boundary wake-ups on $bufferingEventName and resume on $resumeEventName',
    ({ bufferingEventName, resumeEventName }) => {
      fakeVideoElement.currentTime = 1.99;
      fakeVideoElement.paused = false;

      const stopWatching = startWatching();

      expect(jest.getTimerCount()).toBe(1);

      fakeVideoElement.dispatchEvent(new Event(bufferingEventName));

      expect(jest.getTimerCount()).toBe(0);

      jest.advanceTimersByTime(100);

      expect(onPlaybackPositionChange).toHaveBeenCalledTimes(1);

      fakeVideoElement.currentTime = 2.1;
      fakeVideoElement.dispatchEvent(new Event(resumeEventName));

      expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
        activeIndex: 1,
        lastStartedIndex: 1,
      });

      stopWatching();
    },
  );

  it('should resume after stalled playback advances without a resume event', () => {
    fakeVideoElement.currentTime = 1.99;
    fakeVideoElement.paused = false;

    const stopWatching = startWatching();

    fakeVideoElement.dispatchEvent(new Event('stalled'));

    expect(jest.getTimerCount()).toBe(0);

    fakeVideoElement.currentTime = 2.1;
    fakeVideoElement.dispatchEvent(new Event('timeupdate'));

    expect(onPlaybackPositionChange).toHaveBeenLastCalledWith({
      activeIndex: 1,
      lastStartedIndex: 1,
    });
    expect(jest.getTimerCount()).toBe(1);

    stopWatching();
  });

  it('should stop notifying after the returned cleanup runs', () => {
    const stopWatching = startWatching();

    stopWatching();

    fakeVideoElement.currentTime = 5;
    fakeVideoElement.dispatchEvent(new Event('timeupdate'));
    jest.runAllTimers();

    expect(onPlaybackPositionChange).toHaveBeenCalledTimes(1);
  });
});
