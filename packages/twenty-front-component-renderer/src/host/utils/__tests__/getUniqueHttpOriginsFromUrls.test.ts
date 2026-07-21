import { getUniqueHttpOriginsFromUrls } from '../getUniqueHttpOriginsFromUrls';

describe('getUniqueHttpOriginsFromUrls', () => {
  it('should reduce urls to their origins', () => {
    expect(
      getUniqueHttpOriginsFromUrls([
        'https://api.twenty.test/graphql',
        'http://functions.twenty.test/base/path',
      ]),
    ).toEqual(['https://api.twenty.test', 'http://functions.twenty.test']);
  });

  it('should deduplicate identical origins', () => {
    expect(
      getUniqueHttpOriginsFromUrls([
        'https://api.twenty.test/graphql',
        'https://api.twenty.test/rest/front-components/id',
      ]),
    ).toEqual(['https://api.twenty.test']);
  });

  it('should drop undefined urls', () => {
    expect(
      getUniqueHttpOriginsFromUrls([undefined, 'https://api.twenty.test']),
    ).toEqual(['https://api.twenty.test']);
  });

  it('should drop malformed urls', () => {
    expect(
      getUniqueHttpOriginsFromUrls(['not a url', 'https://api.twenty.test']),
    ).toEqual(['https://api.twenty.test']);
  });

  it('should drop urls with non http schemes', () => {
    expect(
      getUniqueHttpOriginsFromUrls([
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'blob:https://api.twenty.test/id',
        'https://api.twenty.test',
      ]),
    ).toEqual(['https://api.twenty.test']);
  });
});
