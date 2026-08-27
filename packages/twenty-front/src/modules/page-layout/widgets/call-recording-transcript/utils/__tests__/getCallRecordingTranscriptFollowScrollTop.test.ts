import { getCallRecordingTranscriptFollowScrollTop } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptFollowScrollTop';

describe('getCallRecordingTranscriptFollowScrollTop', () => {
  it('does not scroll when the active entry is inside the follow area', () => {
    expect(
      getCallRecordingTranscriptFollowScrollTop({
        followTargetBottom: 700,
        followTargetTop: 300,
        scrollContainerClientHeight: 1000,
        scrollContainerScrollTop: 400,
        scrollContainerTop: 100,
      }),
    ).toBeUndefined();
  });

  it('positions an entry outside the follow area at the scroll target', () => {
    expect(
      getCallRecordingTranscriptFollowScrollTop({
        followTargetBottom: 950,
        followTargetTop: 850,
        scrollContainerClientHeight: 1000,
        scrollContainerScrollTop: 400,
        scrollContainerTop: 100,
      }),
    ).toBe(800);
  });

  it('does not return a negative scroll position', () => {
    expect(
      getCallRecordingTranscriptFollowScrollTop({
        followTargetBottom: 150,
        followTargetTop: 50,
        scrollContainerClientHeight: 1000,
        scrollContainerScrollTop: 0,
        scrollContainerTop: 100,
      }),
    ).toBe(0);
  });
});
