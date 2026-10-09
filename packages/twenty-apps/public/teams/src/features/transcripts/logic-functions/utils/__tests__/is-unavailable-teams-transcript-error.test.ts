import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';
import { describe, expect, it } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { isUnavailableTeamsTranscriptError } from 'src/features/transcripts/logic-functions/utils/is-unavailable-teams-transcript-error';

const buildGraphRequestError = (
  status: number,
  innerErrorCode?: string,
): GraphRequestError =>
  new GraphRequestError({
    message: `Microsoft Graph request failed (${status})`,
    status,
    innerErrorCode,
  });

describe('isUnavailableTeamsTranscriptError', () => {
  it('should skip a transcript that Microsoft Graph cannot find or serve', () => {
    expect(isUnavailableTeamsTranscriptError(buildGraphRequestError(404))).toBe(
      true,
    );
    expect(isUnavailableTeamsTranscriptError(buildGraphRequestError(403))).toBe(
      true,
    );
  });

  it('should not skip errors that affect every transcript of the connection', () => {
    expect(
      isUnavailableTeamsTranscriptError(
        buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
      ),
    ).toBe(false);
    expect(isUnavailableTeamsTranscriptError(buildGraphRequestError(401))).toBe(
      false,
    );
    expect(isUnavailableTeamsTranscriptError(buildGraphRequestError(503))).toBe(
      false,
    );
    expect(
      isUnavailableTeamsTranscriptError(
        new AppConnectionAuthFailedError('connected-account-1'),
      ),
    ).toBe(false);
  });
});
