import { describe, expect, it } from 'vitest';

import { TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-counting-poll-milliseconds';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-importing-poll-milliseconds';
import { getTeamsTranscriptHistoryPollDelayMilliseconds } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-poll-delay-milliseconds';

describe('getTeamsTranscriptHistoryPollDelayMilliseconds', () => {
  it('should load the status right away until the first load fails', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: undefined,
        hasLoadError: false,
      }),
    ).toBe(0);
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: undefined,
        hasLoadError: true,
      }),
    ).toBeUndefined();
  });

  it('should keep polling a running count or import, even after a failed load', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'counting' },
        hasLoadError: true,
      }),
    ).toBe(TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS);
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: {
          kind: 'importing',
          importedCount: 0,
          skippedCount: 0,
          unavailableCount: 0,
        },
        hasLoadError: false,
      }),
    ).toBe(TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS);
  });

  it('should stop polling once nothing is running', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'idle' },
        hasLoadError: false,
      }),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'stalled' },
        hasLoadError: false,
      }),
    ).toBeUndefined();
  });
});
