import { describe, expect, it } from 'vitest';

import { getSlackUnfurlFields } from 'src/logic-functions/utils/get-slack-unfurl-fields';

describe('getSlackUnfurlFields', () => {
  it('should send nothing when the caller does not choose, leaving Slack defaults in place', () => {
    expect(getSlackUnfurlFields({})).toEqual({});
  });

  it('should turn off both link and media previews', () => {
    expect(
      getSlackUnfurlFields({ unfurlLinks: false, unfurlMedia: false }),
    ).toEqual({ unfurl_links: false, unfurl_media: false });
  });

  it('should keep each preview switch independent', () => {
    expect(getSlackUnfurlFields({ unfurlLinks: true })).toEqual({
      unfurl_links: true,
    });
  });
});
