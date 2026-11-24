import { describe, expect, it } from 'vitest';

import { getEmailDomain } from 'src/logic-functions/utils/get-email-domain.util';

describe('getEmailDomain', () => {
  it.each([
    ['ada@acme.com', 'acme.com'],
    ['Ada@ACME.com ', 'acme.com'],
    ['"ada@home"@acme.com', 'acme.com'],
  ])('returns the domain of %s', (emailAddress, expectedDomain) => {
    expect(getEmailDomain(emailAddress)).toBe(expectedDomain);
  });

  it.each([[undefined], ['not-an-address'], ['ada@']])(
    'returns undefined for %s',
    (emailAddress) => {
      expect(getEmailDomain(emailAddress)).toBeUndefined();
    },
  );
});
