import { describe, expect, it } from 'vitest';

import { getUserFriendlySyncErrorMessage } from '@/cli/utilities/error/get-user-friendly-sync-error-message';

describe('getUserFriendlySyncErrorMessage', () => {
  it('should return the userFriendlyMessage carried by the error extensions', () => {
    expect(
      getUserFriendlySyncErrorMessage({
        userFriendlyMessage: 'Your dependencies are too large to install.',
      }),
    ).toBe('Your dependencies are too large to install.');
  });

  it('should return undefined when the field is not a string', () => {
    expect(
      getUserFriendlySyncErrorMessage({ userFriendlyMessage: 42 }),
    ).toBeUndefined();
  });

  it('should return undefined when the error is not an object', () => {
    expect(getUserFriendlySyncErrorMessage(undefined)).toBeUndefined();
    expect(getUserFriendlySyncErrorMessage('boom')).toBeUndefined();
  });
});
