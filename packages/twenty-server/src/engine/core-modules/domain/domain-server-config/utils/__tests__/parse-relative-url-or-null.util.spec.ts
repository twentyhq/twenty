import { parseRelativeUrlOrNull } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url-or-null.util';

describe('parseRelativeUrlOrNull', () => {
  it('parses a valid relative URL', () => {
    expect(parseRelativeUrlOrNull('/settings/accounts#connections')).toEqual({
      pathname: '/settings/accounts',
      searchParams: {},
      hash: '#connections',
    });
  });

  it.each(['http://', '//', 'https://%'])(
    'returns null for the invalid URL %s',
    (relativeUrl) => {
      expect(parseRelativeUrlOrNull(relativeUrl)).toBeNull();
    },
  );
});
