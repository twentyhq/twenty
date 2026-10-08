const FOLLOW_TARGET_VISIBLE_AREA_TOP_RATIO = 0.2;
const FOLLOW_TARGET_VISIBLE_AREA_BOTTOM_RATIO = 0.8;
const FOLLOW_TARGET_SCROLL_TARGET_RATIO = 0.35;

export const getCallRecordingTranscriptFollowScrollTop = ({
  followTargetBottom,
  followTargetTop,
  scrollContainerClientHeight,
  scrollContainerScrollTop,
  scrollContainerTop,
}: {
  followTargetBottom: number;
  followTargetTop: number;
  scrollContainerClientHeight: number;
  scrollContainerScrollTop: number;
  scrollContainerTop: number;
}): number | undefined => {
  const visibleAreaTop =
    scrollContainerTop +
    scrollContainerClientHeight * FOLLOW_TARGET_VISIBLE_AREA_TOP_RATIO;
  const visibleAreaBottom =
    scrollContainerTop +
    scrollContainerClientHeight * FOLLOW_TARGET_VISIBLE_AREA_BOTTOM_RATIO;

  if (
    followTargetTop >= visibleAreaTop &&
    followTargetBottom <= visibleAreaBottom
  ) {
    return undefined;
  }

  return Math.max(
    0,
    scrollContainerScrollTop +
      followTargetTop -
      scrollContainerTop -
      scrollContainerClientHeight * FOLLOW_TARGET_SCROLL_TARGET_RATIO,
  );
};
