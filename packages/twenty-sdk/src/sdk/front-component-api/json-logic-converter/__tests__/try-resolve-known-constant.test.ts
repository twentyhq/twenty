import { describe, expect, it } from 'vitest';

import { tryResolveKnownConstant } from '../utils/try-resolve-known-constant';

describe('tryResolveKnownConstant', () => {
  it('resolves a top-level numeric constant', () => {
    expect(
      tryResolveKnownConstant({
        constantPath: 'BACKEND_BATCH_REQUEST_MAX_COUNT',
      }),
    ).toBe(10000);
  });

  it('resolves a top-level numeric constant by name', () => {
    expect(
      tryResolveKnownConstant({ constantPath: 'MUTATION_MAX_MERGE_RECORDS' }),
    ).toBe(9);
  });

  it('resolves a nested property via dot path', () => {
    expect(
      tryResolveKnownConstant({
        constantPath: 'CoreObjectNameSingular.Company',
      }),
    ).toBe('company');
  });

  it('resolves a nested FeatureFlagKey property', () => {
    expect(
      tryResolveKnownConstant({
        constantPath: 'FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
      }),
    ).toBe('IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED');
  });

  it('resolves a nested ActionViewType property', () => {
    expect(
      tryResolveKnownConstant({ constantPath: 'ActionViewType.SHOW_PAGE' }),
    ).toBe('SHOW_PAGE');
  });

  it('returns undefined for an unknown top-level constant', () => {
    expect(
      tryResolveKnownConstant({ constantPath: 'UNKNOWN_CONSTANT' }),
    ).toBeUndefined();
  });

  it('returns undefined for an unknown nested property', () => {
    expect(
      tryResolveKnownConstant({
        constantPath: 'CoreObjectNameSingular.NonExistent',
      }),
    ).toBeUndefined();
  });

  it('returns undefined for an unknown object name in dot path', () => {
    expect(
      tryResolveKnownConstant({
        constantPath: 'UnknownObject.SomeProperty',
      }),
    ).toBeUndefined();
  });

  it('returns undefined for paths with more than 2 segments', () => {
    expect(tryResolveKnownConstant({ constantPath: 'a.b.c' })).toBeUndefined();
  });

  it('returns undefined for a top-level group name (non-primitive)', () => {
    const result = tryResolveKnownConstant({
      constantPath: 'CoreObjectNameSingular',
    });

    expect(result).toBeUndefined();
  });
});
