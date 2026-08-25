import { CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE } from '@/page-layout/widgets/call-recording-transcript/constants/CallRecordingTranscriptCurrentSpokenWordDataAttribute';
import { getCallRecordingTranscriptFollowScrollTop } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptFollowScrollTop';
import { isDefined } from 'twenty-shared/utils';

const FOLLOW_SCROLL_SYNC_EVENT_NAMES = [
  'seeking',
  'seeked',
  'timeupdate',
] as const;

const CURRENT_SPOKEN_WORD_SELECTOR = `[${CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE}]`;

type FollowScrollTargetElement = {
  getBoundingClientRect: () => Pick<DOMRect, 'bottom' | 'top'>;
};

type FollowScrollActiveEntryElement = FollowScrollTargetElement & {
  querySelector: (selector: string) => FollowScrollTargetElement | null;
};

type FollowScrollContainerElement = FollowScrollTargetElement & {
  clientHeight: number;
  scrollTop: number;
  scrollTo: (options: ScrollToOptions) => void;
};

type WatchCallRecordingTranscriptFollowScrollParams = {
  videoElement: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  scrollContainerElement: FollowScrollContainerElement;
  getActiveEntryElement: () => FollowScrollActiveEntryElement | null;
};

export const watchCallRecordingTranscriptFollowScroll = ({
  videoElement,
  scrollContainerElement,
  getActiveEntryElement,
}: WatchCallRecordingTranscriptFollowScrollParams) => {
  let animationFrameId: number | undefined;

  const followPlaybackPosition = () => {
    const activeEntryElement = getActiveEntryElement();
    const followTargetElement =
      activeEntryElement?.querySelector(CURRENT_SPOKEN_WORD_SELECTOR) ??
      activeEntryElement;

    if (!isDefined(followTargetElement)) {
      return;
    }

    const followTargetRectangle = followTargetElement.getBoundingClientRect();
    const scrollContainerRectangle =
      scrollContainerElement.getBoundingClientRect();
    const scrollTop = getCallRecordingTranscriptFollowScrollTop({
      followTargetBottom: followTargetRectangle.bottom,
      followTargetTop: followTargetRectangle.top,
      scrollContainerClientHeight: scrollContainerElement.clientHeight,
      scrollContainerScrollTop: scrollContainerElement.scrollTop,
      scrollContainerTop: scrollContainerRectangle.top,
    });

    if (!isDefined(scrollTop)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    scrollContainerElement.scrollTo({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top: scrollTop,
    });
  };

  // Measured on the next frame so React has committed the word marker for the
  // playback position that triggered the event.
  const scheduleFollowScroll = () => {
    if (isDefined(animationFrameId)) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(followPlaybackPosition);
  };

  for (const eventName of FOLLOW_SCROLL_SYNC_EVENT_NAMES) {
    videoElement.addEventListener(eventName, scheduleFollowScroll);
  }

  scheduleFollowScroll();

  return () => {
    if (isDefined(animationFrameId)) {
      cancelAnimationFrame(animationFrameId);
    }

    for (const eventName of FOLLOW_SCROLL_SYNC_EVENT_NAMES) {
      videoElement.removeEventListener(eventName, scheduleFollowScroll);
    }
  };
};
