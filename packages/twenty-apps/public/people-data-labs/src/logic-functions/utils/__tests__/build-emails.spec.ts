import { describe, expect, it } from 'vitest';

import { buildEmails } from 'src/logic-functions/utils/build-emails';

describe('buildEmails', () => {
  it('keeps the first email as primary and the rest as additional', () => {
    expect(buildEmails(['work@acme.com', 'home@me.com'])).toEqual({
      primaryEmail: 'work@acme.com',
      additionalEmails: ['home@me.com'],
    });
  });

  it('dedupes case-insensitively and skips blanks', () => {
    expect(buildEmails(['work@acme.com', 'WORK@acme.com', '', null])).toEqual({
      primaryEmail: 'work@acme.com',
      additionalEmails: null,
    });
  });

  it('returns undefined when there are no emails', () => {
    expect(buildEmails([null, undefined, ''])).toBeUndefined();
  });
});
