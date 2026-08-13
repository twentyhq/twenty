import { describe, expect, it } from 'vitest';

import { decodeSlackLinkUrl } from 'src/logic-functions/utils/decode-slack-link-url';

describe('decodeSlackLinkUrl', () => {
  it('should decode the html entities Slack escapes in link urls', () => {
    expect(decodeSlackLinkUrl('https://a.com/?a=1&amp;b=2')).toBe(
      'https://a.com/?a=1&b=2',
    );
    expect(decodeSlackLinkUrl('https://a.com/?q=&lt;x&gt;')).toBe(
      'https://a.com/?q=<x>',
    );
  });

  it('should not unescape entities twice', () => {
    expect(decodeSlackLinkUrl('&amp;lt;')).toBe('&lt;');
    expect(decodeSlackLinkUrl('&amp;amp;')).toBe('&amp;');
    expect(decodeSlackLinkUrl('&amp;gt;')).toBe('&gt;');
  });

  it('should leave other entities untouched', () => {
    expect(decodeSlackLinkUrl('https://a.com/?q=&quot;x&quot;')).toBe(
      'https://a.com/?q=&quot;x&quot;',
    );
  });
});
