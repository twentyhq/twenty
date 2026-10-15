import { pickVerifiableSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/pick-verifiable-sri-integrity.util';

describe('pickVerifiableSriIntegrity', () => {
  it('returns null without an attestation', () => {
    expect(pickVerifiableSriIntegrity(null)).toBeNull();
  });

  it('returns null when no attested algorithm can be verified', () => {
    expect(pickVerifiableSriIntegrity('sha1-c2hhMQ==')).toBeNull();
  });

  it('keeps only the attested digests that can be verified', () => {
    expect(
      pickVerifiableSriIntegrity(
        'sha1-c2hhMQ== sha512-c2hhNTEy?opt sha256-c2hhMjU2',
      ),
    ).toBe('sha512-c2hhNTEy sha256-c2hhMjU2');
  });
});
