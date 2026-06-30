import { describe, expect, it } from 'vitest';

import { isEmptyLinks } from 'src/logic-functions/utils/is-empty-links';

describe('isEmptyLinks', () => {
  it('is true when there is no primary link url', () => {
    expect(isEmptyLinks(null)).toBe(true);
    expect(isEmptyLinks({ primaryLinkUrl: '' })).toBe(true);
  });

  it('is false when a primary link url is present', () => {
    expect(isEmptyLinks({ primaryLinkUrl: 'https://acme.com' })).toBe(false);
  });
});
