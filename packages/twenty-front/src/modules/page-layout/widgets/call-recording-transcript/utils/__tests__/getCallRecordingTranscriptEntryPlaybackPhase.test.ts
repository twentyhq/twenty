import { getCallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptEntryPlaybackPhase';

describe('getCallRecordingTranscriptEntryPlaybackPhase', () => {
  it('should return undefined without playback', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: undefined,
        entryIndex: 0,
        lastStartedEntryIndex: undefined,
      }),
    ).toBeUndefined();
  });

  it('should return undefined before the first entry starts', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: -1,
        entryIndex: 0,
        lastStartedEntryIndex: -1,
      }),
    ).toBeUndefined();
  });

  it('should mark the active entry as speaking', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: 2,
        entryIndex: 2,
        lastStartedEntryIndex: 2,
      }),
    ).toBe('speaking');
  });

  it('should mark entries up to the last started one as spoken', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: 2,
        entryIndex: 1,
        lastStartedEntryIndex: 2,
      }),
    ).toBe('spoken');
  });

  it('should mark the started entry as spoken in a silence gap', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: -1,
        entryIndex: 2,
        lastStartedEntryIndex: 2,
      }),
    ).toBe('spoken');
  });

  it('should mark entries after the last started one as upcoming', () => {
    expect(
      getCallRecordingTranscriptEntryPlaybackPhase({
        activeEntryIndex: 2,
        entryIndex: 3,
        lastStartedEntryIndex: 2,
      }),
    ).toBe('upcoming');
  });
});
