import { parseRelativeUrlOrNull } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url-or-null.util';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';

jest.mock(
  'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util',
  () => ({
    parseRelativeUrl: jest.fn(
      jest.requireActual(
        'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util',
      ).parseRelativeUrl,
    ),
  }),
);

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

  it.each([new Error('unexpected'), new TypeError('unexpected')])(
    'rethrows an error that is not an invalid URL: %s',
    (unexpectedError) => {
      jest.mocked(parseRelativeUrl).mockImplementationOnce(() => {
        throw unexpectedError;
      });

      expect(() => parseRelativeUrlOrNull('/settings/accounts')).toThrow(
        unexpectedError,
      );
    },
  );
});
