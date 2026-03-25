import crypto from 'node:crypto';

import { generatePkceChallenge } from '../pkce';

describe('generatePkceChallenge', () => {
  it('should return a code verifier and code challenge', () => {
    const { codeVerifier, codeChallenge } = generatePkceChallenge();

    expect(codeVerifier).toBeDefined();
    expect(codeChallenge).toBeDefined();
    expect(codeVerifier.length).toBeGreaterThan(0);
    expect(codeChallenge.length).toBeGreaterThan(0);
  });

  it('should produce a challenge that is the SHA256 hash of the verifier', () => {
    const { codeVerifier, codeChallenge } = generatePkceChallenge();

    const expectedChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    expect(codeChallenge).toBe(expectedChallenge);
  });

  it('should generate unique values on each call', () => {
    const first = generatePkceChallenge();
    const second = generatePkceChallenge();

    expect(first.codeVerifier).not.toBe(second.codeVerifier);
    expect(first.codeChallenge).not.toBe(second.codeChallenge);
  });

  it('should use base64url encoding with no padding', () => {
    const { codeVerifier, codeChallenge } = generatePkceChallenge();

    // base64url uses - and _ instead of + and /, and no = padding
    expect(codeVerifier).not.toMatch(/[+/=]/);
    expect(codeChallenge).not.toMatch(/[+/=]/);
  });
});
