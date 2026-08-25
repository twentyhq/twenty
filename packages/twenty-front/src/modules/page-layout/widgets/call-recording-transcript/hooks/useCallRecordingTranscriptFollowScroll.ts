import { watchCallRecordingTranscriptFollowScroll } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptFollowScroll';
import { useEffect, type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCallRecordingTranscriptFollowScroll = ({
  activeEntryElementRef,
  isFollowingPlayback,
  scrollContainerElementRef,
  videoElement,
}: {
  activeEntryElementRef: RefObject<HTMLLIElement | null>;
  isFollowingPlayback: boolean;
  scrollContainerElementRef: RefObject<HTMLDivElement | null>;
  videoElement: HTMLVideoElement | undefined;
}) => {
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
};
