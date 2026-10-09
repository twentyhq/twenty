import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';
import { describe, expect, it } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { getTeamsTranscriptHistoryFatalErrorCode } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-fatal-error-code';

const buildGraphRequestError = (
  status: number,
  innerErrorCode?: string,
): GraphRequestError =>
  new GraphRequestError({
    message: `Microsoft Graph request failed (${status})`,
    status,
    innerErrorCode,
  });

describe('getTeamsTranscriptHistoryFatalErrorCode', () => {
  it('should ask to reconnect when the connection can no longer authenticate', () => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(
        new AppConnectionAuthFailedError('connected-account-1'),
      ),
    ).toBe('reconnect-required');
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(buildGraphRequestError(401)),
    ).toBe('reconnect-required');
  });

  it('should report transcripts disabled by the Microsoft admin', () => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(
        buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
      ),
    ).toBe('transcripts-disabled-by-admin');
  });

  it('should leave every other error to the page retries', () => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(buildGraphRequestError(403)),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(buildGraphRequestError(404)),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(buildGraphRequestError(503)),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryFatalErrorCode(new Error('Twenty API failed')),
    ).toBeUndefined();
  });
});
