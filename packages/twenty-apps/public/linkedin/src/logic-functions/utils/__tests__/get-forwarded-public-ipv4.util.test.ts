import { describe, expect, it } from 'vitest';

import { getForwardedPublicIpv4 } from 'src/logic-functions/utils/get-forwarded-public-ipv4.util';

describe('getForwardedPublicIpv4', () => {
  it('returns the client address, first in the forwarding chain', () => {
    expect(getForwardedPublicIpv4('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7');
  });

  it.each([
    undefined,
    '',
    '10.1.2.3',
    '192.168.1.20',
    '127.0.0.1',
    '2001:db8::1',
    'unknown',
  ])('returns nothing for %j', (forwardedForHeader) => {
    expect(getForwardedPublicIpv4(forwardedForHeader)).toBeUndefined();
  });
});
