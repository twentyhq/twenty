import { describe, expect, it } from 'vitest';

import { resolveRequestUrl } from '@/transport/resolve-request-url';

const API_URL = 'https://acme.twenty.com/crm';

describe('resolveRequestUrl', () => {
  it('resolves paths under the API URL, keeping its base path', () => {
    expect(
      resolveRequestUrl({ apiUrl: API_URL, path: '/rest/companies?limit=2' })
        .href,
    ).toBe('https://acme.twenty.com/crm/rest/companies?limit=2');
    expect(
      resolveRequestUrl({ apiUrl: API_URL, path: 'rest/people' }).href,
    ).toBe('https://acme.twenty.com/crm/rest/people');
  });

  it.each([
    'https://elsewhere.example.com/rest/companies',
    '//elsewhere.example.com/rest/companies',
    'javascript:alert(1)',
    '\\\\elsewhere\\share',
    '../other/rest/companies',
  ])('refuses %s', (path) => {
    expect(() => resolveRequestUrl({ apiUrl: API_URL, path })).toThrow(
      expect.objectContaining({ code: 'INVALID_REQUEST_PATH', exitCode: 2 }),
    );
  });
});
