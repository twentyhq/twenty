import { describe, expect, it } from 'vitest';

import { normalizeInviteEmail } from './normalize-invite-email';

describe('normalizeInviteEmail', () => {
  it('trims surrounding whitespace and lowercases', () => {
    expect(normalizeInviteEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
  });

  it('returns empty string unchanged', () => {
    expect(normalizeInviteEmail('')).toBe('');
  });
});
