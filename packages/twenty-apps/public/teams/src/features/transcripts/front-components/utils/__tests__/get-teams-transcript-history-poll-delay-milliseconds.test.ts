import { describe, expect, it } from 'vitest';

import { TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-counting-poll-milliseconds';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-importing-poll-milliseconds';
import { getTeamsTranscriptHistoryPollDelayMilliseconds } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-poll-delay-milliseconds';

const IMPORTING_VIEW = {
  kind: 'importing' as const,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
};

describe('getTeamsTranscriptHistoryPollDelayMilliseconds', () => {
  it('should load the status right away until the first load fails', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: undefined,
        loadErrorCode: undefined,
      }),
    ).toBe(0);
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: undefined,
        loadErrorCode: 'unknown',
      }),
    ).toBeUndefined();
  });

  it('should keep polling a running count or import through an unexpected failure', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'counting' },
        loadErrorCode: 'unknown',
      }),
    ).toBe(TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS);
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: IMPORTING_VIEW,
        loadErrorCode: undefined,
      }),
    ).toBe(TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS);
  });

  it.each([
    'not-connected',
    'reconnect-required',
    'transcripts-not-enabled',
  ] as const)(
    'should stop polling a running import after a %s failure',
    (loadErrorCode) => {
      expect(
        getTeamsTranscriptHistoryPollDelayMilliseconds({
          view: IMPORTING_VIEW,
          loadErrorCode,
        }),
      ).toBeUndefined();
    },
  );

  it('should stop polling once nothing is running', () => {
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'idle' },
        loadErrorCode: undefined,
      }),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryPollDelayMilliseconds({
        view: { kind: 'stalled' },
        loadErrorCode: undefined,
      }),
    ).toBeUndefined();
  });
});
