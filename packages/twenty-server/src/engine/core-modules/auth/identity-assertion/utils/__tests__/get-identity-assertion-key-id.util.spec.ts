import * as jwt from 'jsonwebtoken';

import { getIdentityAssertionKeyId } from 'src/engine/core-modules/auth/identity-assertion/utils/get-identity-assertion-key-id.util';

describe('getIdentityAssertionKeyId', () => {
  it('should return the key id of the assertion header', () => {
    const assertion = jwt.sign({}, 'secret', { keyid: 'key-id' });

    expect(getIdentityAssertionKeyId(assertion)).toBe('key-id');
  });

  it('should return undefined when the assertion has no key id', () => {
    const assertion = jwt.sign({}, 'secret');

    expect(getIdentityAssertionKeyId(assertion)).toBeUndefined();
  });

  it('should return undefined when the assertion is not a JWT', () => {
    expect(getIdentityAssertionKeyId('not-a-jwt')).toBeUndefined();
  });
});
