import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';
import { countStartedCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/countStartedCallRecordingTranscriptTimePoints';
import { isDefined } from 'twenty-shared/utils';

const PLAYBACK_SYNC_EVENT_NAMES = [
  'play',
  'pause',
  'seeking',
  'seeked',
  'ratechange',
] as const;

const PLAYBACK_BUFFERING_EVENT_NAMES = ['waiting', 'stalled'] as const;
const PLAYBACK_RESUME_EVENT_NAMES = ['playing', 'canplay'] as const;

const MINIMUM_BOUNDARY_DELAY_IN_MS = 10;

type WatchCallRecordingTranscriptPlaybackParams = {
  videoElement: Pick<EventTarget, 'addEventListener' | 'removeEventListener'> &
    Pick<
      HTMLMediaElement,
      'currentTime' | 'paused' | 'playbackRate' | 'seeking'
    >;
  timePoints: CallRecordingTranscriptTimePoint[];
  onPlaybackPositionChange: (playbackPosition: {
    activeIndex: number;
    lastStartedIndex: number;
  }) => void;
};

// timeupdate only fires ~4 times per second, too coarse for word-level sync;
// while playing, a timeout aimed at the next boundary fills the gaps. Every
// wake re-reads currentTime, so seeks and rate changes self-correct.
export const watchCallRecordingTranscriptPlayback = ({
  videoElement,
  timePoints,
  onPlaybackPositionChange,
}: WatchCallRecordingTranscriptPlaybackParams) => {
  let lastNotifiedActiveIndex: number | undefined;
  let lastNotifiedLastStartedIndex: number | undefined;
  let boundaryTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let isPlaybackBuffering = false;
  let bufferingStartTimeSeconds: number | undefined;

  const clearBoundaryTimeout = () => {
    clearTimeout(boundaryTimeoutId);
    boundaryTimeoutId = undefined;
  };

  const syncPlaybackPosition = () => {
    clearBoundaryTimeout();

    const startedTimePointCount = countStartedCallRecordingTranscriptTimePoints(
      {
        timePoints,
        currentTimeSeconds: videoElement.currentTime,
      },
    );

    const lastStartedTimePoint = timePoints[startedTimePointCount - 1];
    const lastStartedIndex = !isDefined(lastStartedTimePoint)
      ? -1
      : lastStartedTimePoint.index;
    const activeIndex =
      !isDefined(lastStartedTimePoint) ||
      (isDefined(lastStartedTimePoint.endSeconds) &&
        videoElement.currentTime >= lastStartedTimePoint.endSeconds)
        ? -1
        : lastStartedTimePoint.index;

    if (
      activeIndex !== lastNotifiedActiveIndex ||
      lastStartedIndex !== lastNotifiedLastStartedIndex
    ) {
      lastNotifiedActiveIndex = activeIndex;
      lastNotifiedLastStartedIndex = lastStartedIndex;
      onPlaybackPositionChange({ activeIndex, lastStartedIndex });
    }

    const nextTimePoint = timePoints[startedTimePointCount];
    const currentTimePointEndSeconds = lastStartedTimePoint?.endSeconds;
    const nextBoundarySeconds =
      isDefined(currentTimePointEndSeconds) &&
      currentTimePointEndSeconds > videoElement.currentTime &&
      (!isDefined(nextTimePoint) ||
        currentTimePointEndSeconds < nextTimePoint.startSeconds)
        ? currentTimePointEndSeconds
        : nextTimePoint?.startSeconds;

    if (
      videoElement.paused ||
      videoElement.seeking ||
      isPlaybackBuffering ||
      !isDefined(nextBoundarySeconds)
    ) {
      return;
    }

    const mediaSecondsUntilBoundary =
      nextBoundarySeconds - videoElement.currentTime;
    const wallClockDelayInMs =
      (mediaSecondsUntilBoundary / (videoElement.playbackRate || 1)) * 1000;

    boundaryTimeoutId = setTimeout(
      syncPlaybackPosition,
      Math.max(wallClockDelayInMs, MINIMUM_BOUNDARY_DELAY_IN_MS),
    );
  };

  const suspendPlaybackSynchronization = () => {
    isPlaybackBuffering = true;
    bufferingStartTimeSeconds = videoElement.currentTime;
    clearBoundaryTimeout();
  };

  const resumePlaybackSynchronization = () => {
    isPlaybackBuffering = false;
    bufferingStartTimeSeconds = undefined;
    syncPlaybackPosition();
  };

  const synchronizeOnTimeUpdate = () => {
    if (
      isPlaybackBuffering &&
      isDefined(bufferingStartTimeSeconds) &&
      videoElement.currentTime > bufferingStartTimeSeconds
    ) {
      isPlaybackBuffering = false;
      bufferingStartTimeSeconds = undefined;
    }

    syncPlaybackPosition();
  };

  PLAYBACK_SYNC_EVENT_NAMES.forEach((eventName) =>
    videoElement.addEventListener(eventName, syncPlaybackPosition),
  );
  PLAYBACK_BUFFERING_EVENT_NAMES.forEach((eventName) =>
    videoElement.addEventListener(eventName, suspendPlaybackSynchronization),
  );
  PLAYBACK_RESUME_EVENT_NAMES.forEach((eventName) =>
    videoElement.addEventListener(eventName, resumePlaybackSynchronization),
  );
  videoElement.addEventListener('timeupdate', synchronizeOnTimeUpdate);

  syncPlaybackPosition();

  return () => {
    clearBoundaryTimeout();

    PLAYBACK_SYNC_EVENT_NAMES.forEach((eventName) =>
      videoElement.removeEventListener(eventName, syncPlaybackPosition),
    );
    PLAYBACK_BUFFERING_EVENT_NAMES.forEach((eventName) =>
      videoElement.removeEventListener(
        eventName,
        suspendPlaybackSynchronization,
      ),
    );
    PLAYBACK_RESUME_EVENT_NAMES.forEach((eventName) =>
      videoElement.removeEventListener(
        eventName,
        resumePlaybackSynchronization,
      ),
    );
    videoElement.removeEventListener('timeupdate', synchronizeOnTimeUpdate);
  };
};
