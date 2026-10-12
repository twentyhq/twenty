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
      getTeamsTranscriptHistoryFatalErrorCode({
        error: new AppConnectionAuthFailedError('connected-account-1'),
        attempt: 0,
      }),
    ).toBe('reconnect-required');
  });

  it('should retry a first Graph 401 and ask to reconnect after that', () => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode({
        error: buildGraphRequestError(401),
        attempt: 0,
      }),
    ).toBeUndefined();
    expect(
      getTeamsTranscriptHistoryFatalErrorCode({
        error: buildGraphRequestError(401),
        attempt: 1,
      }),
    ).toBe('reconnect-required');
  });

  it('should report transcripts disabled by the Microsoft admin', () => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode({
        error: buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
        attempt: 0,
      }),
    ).toBe('transcripts-disabled-by-admin');
  });

  it.each([
    buildGraphRequestError(403),
    buildGraphRequestError(404),
    buildGraphRequestError(503),
    new Error('Twenty API failed'),
  ])('should leave %s to the page retries', (error) => {
    expect(
      getTeamsTranscriptHistoryFatalErrorCode({ error, attempt: 0 }),
    ).toBeUndefined();
  });
});
