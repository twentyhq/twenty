import { watchCallRecordingTranscriptFollowScroll } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptFollowScroll';
import { useEffect, type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingTranscriptFollowScrollEffectProps = {
  activeEntryElementRef: RefObject<HTMLLIElement | null>;
  isFollowingPlayback: boolean;
  scrollContainerElementRef: RefObject<HTMLDivElement | null>;
  videoElement?: HTMLVideoElement;
  onVideoSeeking: () => void;
};

export const CallRecordingTranscriptFollowScrollEffect = ({
  activeEntryElementRef,
  isFollowingPlayback,
  scrollContainerElementRef,
  videoElement,
  onVideoSeeking,
}: CallRecordingTranscriptFollowScrollEffectProps) => {
  useEffect(() => {
    const scrollContainerElement = scrollContainerElementRef.current;

    if (!isDefined(videoElement)) {
      return;
    }

    videoElement.addEventListener('seeking', onVideoSeeking);

    const stopWatchingFollowScroll =
      isFollowingPlayback && isDefined(scrollContainerElement)
        ? watchCallRecordingTranscriptFollowScroll({
            videoElement,
            scrollContainerElement,
            getActiveEntryElement: () => activeEntryElementRef.current,
          })
        : undefined;

    return () => {
      videoElement.removeEventListener('seeking', onVideoSeeking);
      stopWatchingFollowScroll?.();
    };
  }, [
    activeEntryElementRef,
    isFollowingPlayback,
    onVideoSeeking,
    scrollContainerElementRef,
    videoElement,
  ]);

  return null;
};
