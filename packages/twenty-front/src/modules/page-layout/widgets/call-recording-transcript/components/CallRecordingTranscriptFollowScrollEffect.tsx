import { watchCallRecordingTranscriptFollowScroll } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptFollowScroll';
import { useEffect, type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CallRecordingTranscriptFollowScrollEffectProps = {
  activeEntryElementRef: RefObject<HTMLLIElement | null>;
  isFollowingPlayback: boolean;
  scrollContainerElementRef: RefObject<HTMLDivElement | null>;
  videoElement?: HTMLVideoElement;
};

export const CallRecordingTranscriptFollowScrollEffect = ({
  activeEntryElementRef,
  isFollowingPlayback,
  scrollContainerElementRef,
  videoElement,
}: CallRecordingTranscriptFollowScrollEffectProps) => {
  useEffect(() => {
    const scrollContainerElement = scrollContainerElementRef.current;

    if (
      !isFollowingPlayback ||
      !isDefined(videoElement) ||
      !isDefined(scrollContainerElement)
    ) {
      return;
    }

    return watchCallRecordingTranscriptFollowScroll({
      videoElement,
      scrollContainerElement,
      getActiveEntryElement: () => activeEntryElementRef.current,
    });
  }, [
    activeEntryElementRef,
    isFollowingPlayback,
    scrollContainerElementRef,
    videoElement,
  ]);

  return null;
};
