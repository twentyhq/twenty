import { describe, expect, it } from 'vitest';

import {
  FALLBACK_SEARCH_ERROR_MESSAGE,
  parseSlackUserSearchResponse,
} from 'src/front-components/utils/parse-slack-user-search-response.util';

describe('parseSlackUserSearchResponse', () => {
  it('should fall back to the generic error when the value is not a record', () => {
    expect(parseSlackUserSearchResponse('nope')).toEqual({
      options: [],
      errorMessage: FALLBACK_SEARCH_ERROR_MESSAGE,
    });
  });

  it('should surface the server error on failure, falling back when missing', () => {
    expect(
      parseSlackUserSearchResponse({ success: false, error: 'Not allowed' }),
    ).toEqual({ options: [], errorMessage: 'Not allowed' });
    expect(parseSlackUserSearchResponse({ success: false })).toEqual({
      options: [],
      errorMessage: FALLBACK_SEARCH_ERROR_MESSAGE,
    });
  });

  it('should return no options and no error when slackUsers is not an array', () => {
    expect(
      parseSlackUserSearchResponse({ success: true, slackUsers: 'nope' }),
    ).toEqual({ options: [], errorMessage: undefined });
  });

  it('should map valid entries and skip malformed or teamless ones', () => {
    expect(
      parseSlackUserSearchResponse({
        success: true,
        slackUsers: [
          'not-a-record',
          { displayName: 'No Id' },
          { slackUserId: 'U2', slackTeamId: '' },
          {
            slackUserId: 'U1',
            slackTeamId: 'T1',
            displayName: 'Ada',
            email: 'ada@twenty.com',
          },
        ],
      }),
    ).toEqual({
      options: [
        {
          slackUserId: 'U1',
          slackTeamId: 'T1',
          displayName: 'Ada',
          email: 'ada@twenty.com',
          isInInstalledWorkspace: true,
        },
      ],
      errorMessage: undefined,
    });
  });
});
