import { type Expect, type HasAllProperties } from 'twenty-shared/testing';
import { describe, expect, it } from 'vitest';

import { CoreApiClient } from '../../core/generated/index';
import { type TwentyGeneratedClientOptions } from '../twenty-client-template';

type StubOptions = NonNullable<ConstructorParameters<typeof CoreApiClient>[0]>;
type GeneratedOptions = NonNullable<TwentyGeneratedClientOptions>;

type _StubHasEveryGeneratedOption = Expect<
  HasAllProperties<StubOptions, GeneratedOptions>
>;
type _GeneratedHasEveryStubOption = Expect<
  HasAllProperties<GeneratedOptions, StubOptions>
>;

describe('CoreApiClient stub', () => {
  it('accepts the full generated option set and still refuses to run', () => {
    expect(
      () =>
        new CoreApiClient({
          url: 'https://example.test/graphql',
          headers: { Authorization: 'Bearer token' },
          fetcher: async () => ({}),
          fetch: globalThis.fetch,
          batch: false,
          runAs: 'application',
        }),
    ).toThrow('CoreApiClient was not generated.');
  });
});
