import { describe, expect, it } from 'vitest';

import { CoreApiClient } from '../../core/generated/index';
import { type TwentyGeneratedClientOptions } from '../twenty-client-template';

type StubOptions = NonNullable<ConstructorParameters<typeof CoreApiClient>[0]>;
type GeneratedOptions = NonNullable<TwentyGeneratedClientOptions>;

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

type Assert<TCondition extends true> = TCondition;
type AssertAssignable<TExpected, TActual extends TExpected> = TActual;

type _OptionNamesMatch = Assert<
  Equal<keyof StubOptions, keyof GeneratedOptions>
>;

type _StubAcceptsEveryGeneratedOption = AssertAssignable<
  StubOptions,
  GeneratedOptions
>;
type _GeneratedAcceptsEveryStubOption = AssertAssignable<
  GeneratedOptions,
  StubOptions
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
