import { pickSha512Integrity } from 'src/engine/core-modules/application/application-registration-version/utils/pick-sha512-integrity.util';

const SHA512_INTEGRITY = `sha512-${'A'.repeat(86)}==`;

describe('pickSha512Integrity', () => {
  it('selects sha512 from registry attestations', () => {
    expect(pickSha512Integrity(`sha256-other ${SHA512_INTEGRITY}`)).toBe(
      SHA512_INTEGRITY,
    );
  });

  it.each([null, '', 'sha1-other', 'sha384-other', 'sha512-malformed'])(
    'leaves an unsupported or malformed attestation unfingerprinted: %s',
    (integrity) => expect(pickSha512Integrity(integrity)).toBeNull(),
  );
});
