import { describe, expect, it } from 'vitest';

import { isLinkableGraphUser } from 'src/features/chat/logic-functions/utils/is-linkable-graph-user';

describe('isLinkableGraphUser', () => {
  it('accepts a user with an id and a mail', () => {
    expect(
      isLinkableGraphUser({ id: 'aad-1', mail: 'ada@twenty.com' }),
    ).toBe(true);
  });

  it('accepts a user with an id and only a user principal name', () => {
    expect(
      isLinkableGraphUser({ id: 'aad-1', userPrincipalName: 'ada@twenty.com' }),
    ).toBe(true);
  });

  it('rejects a user without an id', () => {
    expect(isLinkableGraphUser({ mail: 'ada@twenty.com' })).toBe(false);
  });

  it('rejects a user with neither mail nor user principal name', () => {
    expect(isLinkableGraphUser({ id: 'aad-1', displayName: 'Room 5' })).toBe(
      false,
    );
  });
});
