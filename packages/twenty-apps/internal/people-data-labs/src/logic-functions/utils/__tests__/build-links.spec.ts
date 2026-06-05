import { describe, expect, it } from 'vitest';

import { buildLinks } from 'src/logic-functions/utils/build-links';

describe('buildLinks', () => {
  it('builds a links value with a blank label by default', () => {
    expect(buildLinks('https://acme.com')).toEqual({
      primaryLinkUrl: 'https://acme.com',
      primaryLinkLabel: '',
      secondaryLinks: null,
    });
  });

  it('uses the provided label', () => {
    expect(buildLinks('https://acme.com', 'Acme')).toEqual({
      primaryLinkUrl: 'https://acme.com',
      primaryLinkLabel: 'Acme',
      secondaryLinks: null,
    });
  });

  it('returns undefined when the url is empty', () => {
    expect(buildLinks('')).toBeUndefined();
  });
});
