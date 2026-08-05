import { describe, expect, it } from 'vitest';

import { isEmptyEmails } from 'src/logic-functions/utils/is-empty-emails';

describe('isEmptyEmails', () => {
  it('is true when there is no primary email', () => {
    expect(isEmptyEmails(null)).toBe(true);
    expect(isEmptyEmails({ primaryEmail: '' })).toBe(true);
  });

  it('is false when a primary email is present', () => {
    expect(isEmptyEmails({ primaryEmail: 'jane@acme.com' })).toBe(false);
  });
});
