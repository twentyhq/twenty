import { splitUrlProtocol } from '@/object-record/record-form/utils/splitUrlProtocol';

describe('splitUrlProtocol', () => {
  it.each([
    ['https://example.com/path', 'https://', 'example.com/path'],
    ['http://example.com:8080', 'http://', 'example.com:8080'],
    ['HTTPS://Example.com', 'HTTPS://', 'Example.com'],
    ['http://', 'http://', ''],
  ])('splits %s', (url, protocol, urlWithoutProtocol) => {
    expect(splitUrlProtocol(url)).toEqual({ protocol, urlWithoutProtocol });
  });

  it.each(['example.com', 'ftp://example.com', ''])(
    'keeps %s whole when it has no http protocol',
    (url) => {
      expect(splitUrlProtocol(url)).toEqual({
        protocol: undefined,
        urlWithoutProtocol: url,
      });
    },
  );
});
