import { getApplicationAuthorDisplayName } from 'src/engine/core-modules/application/application-registration/utils/get-application-author-display-name.util';

describe('getApplicationAuthorDisplayName', () => {
  it('should return a plain author string as is', () => {
    expect(getApplicationAuthorDisplayName('Excelium Tech')).toBe(
      'Excelium Tech',
    );
  });

  it('should trim surrounding whitespace', () => {
    expect(getApplicationAuthorDisplayName('  Excelium Tech  ')).toBe(
      'Excelium Tech',
    );
  });

  it('should return the name of a serialized npm-style author object', () => {
    expect(
      getApplicationAuthorDisplayName(
        '{"name":"akacores","url":"https://github.com/akacores"}',
      ),
    ).toBe('akacores');
  });

  it('should return the name of an npm-style author object', () => {
    expect(
      getApplicationAuthorDisplayName({
        name: 'akacores',
        email: 'hello@example.com',
      }),
    ).toBe('akacores');
  });

  it('should return null for an author object without a name', () => {
    expect(
      getApplicationAuthorDisplayName('{"url":"https://github.com/akacores"}'),
    ).toBeNull();
    expect(getApplicationAuthorDisplayName({ url: 'https://x.y' })).toBeNull();
  });

  it('should keep a string that only looks like JSON', () => {
    expect(getApplicationAuthorDisplayName('{not json')).toBe('{not json');
  });

  it('should return null for empty or non-string values', () => {
    expect(getApplicationAuthorDisplayName(null)).toBeNull();
    expect(getApplicationAuthorDisplayName(undefined)).toBeNull();
    expect(getApplicationAuthorDisplayName('')).toBeNull();
    expect(getApplicationAuthorDisplayName('   ')).toBeNull();
    expect(getApplicationAuthorDisplayName(42)).toBeNull();
    expect(getApplicationAuthorDisplayName(['akacores'])).toBeNull();
  });
});
