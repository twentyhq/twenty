import { describe, expect, it } from 'vitest';

import {
  FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
  parseSlackChannelSearchResponse,
} from 'src/front-components/utils/parse-slack-channel-search-response.util';

describe('parseSlackChannelSearchResponse', () => {
  it('should fall back to the generic error when the value is not a record', () => {
    expect(parseSlackChannelSearchResponse('nope')).toEqual({
      options: [],
      errorMessage: FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
    });
  });

  it('should surface the server error on failure, falling back when missing', () => {
    expect(
      parseSlackChannelSearchResponse({ success: false, error: 'Not allowed' }),
    ).toEqual({ options: [], errorMessage: 'Not allowed' });
    expect(parseSlackChannelSearchResponse({ success: false })).toEqual({
      options: [],
      errorMessage: FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
    });
  });

  it('should return no options and no error when slackChannels is not an array', () => {
    expect(
      parseSlackChannelSearchResponse({ success: true, slackChannels: 'nope' }),
    ).toEqual({ options: [], errorMessage: undefined });
  });

  it('should map valid entries and skip malformed ones', () => {
    expect(
      parseSlackChannelSearchResponse({
        success: true,
        slackChannels: [
          'not-a-record',
          { name: 'no-id' },
          { slackChannelId: 'C2', name: '' },
          { slackChannelId: 'C1', name: 'eng', isPrivate: true },
        ],
      }),
    ).toEqual({
      options: [
        { slackChannelId: 'C1', name: 'eng', isPrivate: true, isMember: false },
      ],
      errorMessage: undefined,
    });
  });
});
