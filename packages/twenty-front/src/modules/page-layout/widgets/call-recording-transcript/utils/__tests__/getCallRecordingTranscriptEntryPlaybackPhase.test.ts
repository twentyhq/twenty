import { getCallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptEntryPlaybackPhase';

describe('getCallRecordingTranscriptEntryPlaybackPhase', () => {
  it('should return undefined without playback', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 0,
        playbackPosition: undefined,
      }),
    ).toBeUndefined();
  });

  it('should return undefined before the first entry starts', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 0,
        playbackPosition: { activeIndex: -1, lastStartedIndex: -1 },
      }),
    ).toBeUndefined();
  });

  it('should mark the active entry as speaking', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 2,
        playbackPosition: { activeIndex: 2, lastStartedIndex: 2 },
      }),
    ).toBe('speaking');
  });

  it('should mark entries up to the last started one as spoken', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 1,
        playbackPosition: { activeIndex: 2, lastStartedIndex: 2 },
      }),
    ).toBe('spoken');
  });

  it('should mark the started entry as spoken in a silence gap', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 2,
        playbackPosition: { activeIndex: -1, lastStartedIndex: 2 },
      }),
    ).toBe('spoken');
  });

  it('should mark entries after the last started one as upcoming', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        entryIndex: 3,
        playbackPosition: { activeIndex: 2, lastStartedIndex: 2 },
      }),
    ).toBe('upcoming');
  });
});
