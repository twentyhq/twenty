import { describe, expect, it } from 'vitest';

import { extractHttpUrls } from 'src/logic-functions/utils/extract-http-urls';

describe('extractHttpUrls', () => {
  it('should extract bare URLs and drop trailing punctuation', () => {
    expect(
      extractHttpUrls('See https://acme.dev/a, then https://acme.dev/b.'),
    ).toEqual(['https://acme.dev/a', 'https://acme.dev/b']);
  });

  it('should extract the URL from markdown links', () => {
    expect(extractHttpUrls('[ACME](https://acme.dev/about)')).toEqual([
      'https://acme.dev/about',
    ]);
  });

  it('should extract the URL from Slack mrkdwn links', () => {
    expect(extractHttpUrls('<https://acme.dev/about|ACME>')).toEqual([
      'https://acme.dev/about',
    ]);
  });

  it('should keep query punctuation that belongs to the URL', () => {
    expect(extractHttpUrls('https://acme.dev/a?q=hi!')).toEqual([
      'https://acme.dev/a?q=hi!',
    ]);
  });

  it('should trim sentence punctuation from a URL with no query', () => {
    expect(extractHttpUrls('See https://acme.dev/object/company/x!')).toEqual([
      'https://acme.dev/object/company/x',
    ]);
    expect(extractHttpUrls('Really https://acme.dev/a?')).toEqual([
      'https://acme.dev/a',
    ]);
  });

  it('should not keep wrapping delimiters', () => {
    expect(extractHttpUrls('"https://acme.dev/a"')).toEqual([
      'https://acme.dev/a',
    ]);
    expect(extractHttpUrls('*https://acme.dev/a*')).toEqual([
      'https://acme.dev/a',
    ]);
    expect(extractHttpUrls('(https://acme.dev/a)')).toEqual([
      'https://acme.dev/a',
    ]);
  });

  it('should return an empty list when there is no URL', () => {
    expect(extractHttpUrls('no links here')).toEqual([]);
  });
});
