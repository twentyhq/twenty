import { parseSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/parse-sri-integrity.util';

describe('parseSriIntegrity', () => {
  it('reads one digest per whitespace-separated entry', () => {
    expect(parseSriIntegrity(' sha512-AAA=  sha256-BBB= ')).toEqual([
      { algorithm: 'sha512', digest: 'AAA=' },
      { algorithm: 'sha256', digest: 'BBB=' },
    ]);
  });

  it('drops options and entries in unsupported algorithms', () => {
    expect(parseSriIntegrity('sha1-CCC= sha384-DDD=?foo=bar')).toEqual([
      { algorithm: 'sha384', digest: 'DDD=' },
    ]);
  });

  it('ignores malformed entries', () => {
    expect(parseSriIntegrity('sha512- notanentry')).toEqual([]);
  });
});
