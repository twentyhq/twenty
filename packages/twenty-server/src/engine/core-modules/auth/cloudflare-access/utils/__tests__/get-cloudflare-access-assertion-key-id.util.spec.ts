import * as jwt from 'jsonwebtoken';

import { getCloudflareAccessAssertionKeyId } from 'src/engine/core-modules/auth/cloudflare-access/utils/get-cloudflare-access-assertion-key-id.util';

describe('getCloudflareAccessAssertionKeyId', () => {
  it('should return the key id of the assertion header', () => {
    const assertion = jwt.sign({}, 'secret', { keyid: 'key-id' });

    expect(getCloudflareAccessAssertionKeyId(assertion)).toBe('key-id');
  });

  it('should return undefined when the assertion has no key id', () => {
    const assertion = jwt.sign({}, 'secret');

    expect(getCloudflareAccessAssertionKeyId(assertion)).toBeUndefined();
  });

  it('should return undefined when the assertion is not a JWT', () => {
    expect(getCloudflareAccessAssertionKeyId('not-a-jwt')).toBeUndefined();
  });
});
