import { describe, expect, it } from 'vitest';

import { prepareUrl } from 'src/logic-functions/data/prepare-url.util';

const readParams = (url: string): URLSearchParams =>
  new URLSearchParams(url.split('?')[1]);

describe('prepareUrl', () => {
  it('should target the connections endpoint of the signed-in user', () => {
    expect(
      prepareUrl({ syncToken: null, pageToken: undefined }).split('?')[0],
    ).toBe('/people/me/connections');
  });

  it('should always ask for a sync token', () => {
    const params = readParams(
      prepareUrl({ syncToken: null, pageToken: undefined }),
    );

    expect(params.get('requestSyncToken')).toBe('true');
    expect(params.get('personFields')).toContain('metadata');
  });

  it('should omit the sync token on a full sync', () => {
    const params = readParams(
      prepareUrl({ syncToken: null, pageToken: undefined }),
    );

    expect(params.has('syncToken')).toBe(false);
    expect(params.has('pageToken')).toBe(false);
  });

  it('should carry the sync and page tokens when they are given', () => {
    const params = readParams(
      prepareUrl({ syncToken: 'sync-1', pageToken: 'page-1' }),
    );

    expect(params.get('syncToken')).toBe('sync-1');
    expect(params.get('pageToken')).toBe('page-1');
  });
});
