import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';
import { describe, expect, it } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { isUnavailableTeamsTranscriptError } from 'src/features/transcripts/logic-functions/utils/is-unavailable-teams-transcript-error';

const buildGraphRequestError = (status: number, innerErrorCode?: string) =>
  new GraphRequestError({
    message: `Microsoft Graph request failed (${status})`,
    status,
    innerErrorCode,
  });

describe('isUnavailableTeamsTranscriptError', () => {
  it.each([
    [
      'a transcript Microsoft Graph cannot find',
      buildGraphRequestError(404),
      true,
    ],
    ['a transcript the account cannot read', buildGraphRequestError(403), true],
    [
      'transcripts disabled by an admin',
      buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
      false,
    ],
    ['a rejected token', buildGraphRequestError(401), false],
    ['a Microsoft Graph outage', buildGraphRequestError(503), false],
    [
      'a broken connection',
      new AppConnectionAuthFailedError('connected-account-1'),
      false,
    ],
  ])('should tell whether %s is unavailable', (_, error, isUnavailable) => {
    expect(isUnavailableTeamsTranscriptError(error)).toBe(isUnavailable);
  });
});
