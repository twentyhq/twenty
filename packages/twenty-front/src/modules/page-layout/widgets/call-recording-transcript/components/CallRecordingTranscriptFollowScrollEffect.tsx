import { watchCallRecordingTranscriptFollowScroll } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptFollowScroll';
import { useEffect, type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingTranscriptFollowScrollEffectProps = {
  activeEntryElementRef: RefObject<HTMLLIElement | null>;
  isFollowingPlayback: boolean;
  scrollContainerElementRef: RefObject<HTMLDivElement | null>;
  mediaElement?: HTMLMediaElement;
  onMediaSeeking: () => void;
};

export const CallRecordingTranscriptFollowScrollEffect = ({
  activeEntryElementRef,
  isFollowingPlayback,
  scrollContainerElementRef,
  mediaElement,
  onMediaSeeking,
}: CallRecordingTranscriptFollowScrollEffectProps) => {
  useEffect(() => {
    const scrollContainerElement = scrollContainerElementRef.current;

    if (!isDefined(mediaElement)) {
      return;
    }

    mediaElement.addEventListener('seeking', onMediaSeeking);

    const stopWatchingFollowScroll =
      isFollowingPlayback && isDefined(scrollContainerElement)
        ? watchCallRecordingTranscriptFollowScroll({
            videoElement: mediaElement,
            scrollContainerElement,
            getActiveEntryElement: () => activeEntryElementRef.current,
          })
        : undefined;

    return () => {
      mediaElement.removeEventListener('seeking', onMediaSeeking);
      stopWatchingFollowScroll?.();
    };
  }, [
    activeEntryElementRef,
    isFollowingPlayback,
    onMediaSeeking,
    scrollContainerElementRef,
    mediaElement,
  ]);

  return null;
};
