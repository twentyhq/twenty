import { describe, expect, it } from 'vitest';

import { CoreApiClient } from '../index';

// The stub's constructor signature must accept every option the generated
// client accepts (see generate/twenty-client-template.ts), otherwise apps
// typecheck against a narrower stub than what `yarn twenty dev` produces.
describe('CoreApiClient (pre-generation stub)', () => {
  it('accepts the generated client options and throws the not-generated error', () => {
    expect(
      () =>
        new CoreApiClient({
          url: 'https://api.twenty.test/graphql',
          headers: { Authorization: 'Bearer token' },
          fetcher: async () => ({}),
          fetch: globalThis.fetch,
          batch: true,
          runAs: 'application',
        }),
    ).toThrow('CoreApiClient was not generated.');
  });

  it('throws the not-generated error when constructed without options', () => {
    expect(() => new CoreApiClient()).toThrow(
      'CoreApiClient was not generated.',
    );
  });
});
