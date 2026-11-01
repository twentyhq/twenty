import { describe, expect, it } from 'vitest';

import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';

describe('buildLinkedinProfileHandle', () => {
  it('builds the profile URL from the public identifier', () => {
    expect(
      buildLinkedinProfileHandle({
        id: 'ACoAAA',
        public_identifier: 'ada-lovelace',
        profile_url: 'https://www.linkedin.com/in/ACoAAA',
      }),
    ).toBe('https://www.linkedin.com/in/ada-lovelace');
  });

  it('falls back to the profile URL', () => {
    expect(
      buildLinkedinProfileHandle({
        id: 'ACoAAA',
        profile_url: 'https://www.linkedin.com/in/ada',
      }),
    ).toBe('https://www.linkedin.com/in/ada');
  });

  it('falls back to the provider id', () => {
    expect(buildLinkedinProfileHandle({ id: 'ACoAAA' })).toBe(
      'https://www.linkedin.com/in/ACoAAA',
    );
  });
});
