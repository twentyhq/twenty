import { describe, expect, it } from 'vitest';

import { getOptimisticApplicationVariableValue } from 'src/front-components/utils/get-optimistic-application-variable-value.util';

describe('getOptimisticApplicationVariableValue', () => {
  it('never retains a saved secret in plaintext', () => {
    expect(
      getOptimisticApplicationVariableValue({
        value: 'new-secret',
        isSecret: true,
      }),
    ).toBe('********');
  });

  it('keeps cleared secrets and non-secret values unchanged', () => {
    expect(
      getOptimisticApplicationVariableValue({ value: '', isSecret: true }),
    ).toBe('');
    expect(
      getOptimisticApplicationVariableValue({
        value: 'visible-value',
        isSecret: false,
      }),
    ).toBe('visible-value');
  });
});
