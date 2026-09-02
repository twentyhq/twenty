import { describe, expect, it } from 'vitest';

import { isApplicationVariableDraftUnchanged } from 'src/front-components/utils/is-application-variable-draft-unchanged.util';

describe('isApplicationVariableDraftUnchanged', () => {
  it('compares non-secret drafts with their persisted value', () => {
    expect(
      isApplicationVariableDraftUnchanged({
        persistedValue: 'visible-value',
        valueToSave: 'visible-value',
        isSecret: false,
      }),
    ).toBe(true);
  });

  it('does not compare secret drafts with their masked value', () => {
    expect(
      isApplicationVariableDraftUnchanged({
        persistedValue: '********',
        valueToSave: '********',
        isSecret: true,
      }),
    ).toBe(false);
  });
});
