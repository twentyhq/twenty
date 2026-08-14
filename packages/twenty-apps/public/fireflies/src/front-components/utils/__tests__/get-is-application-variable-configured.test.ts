import { describe, expect, it } from 'vitest';

import { getIsApplicationVariableConfigured } from 'src/front-components/utils/get-is-application-variable-configured.util';

describe('getIsApplicationVariableConfigured', () => {
  it('is configured when untouched and a value is stored', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: undefined,
        storedValue: 'dem********',
      }),
    ).toBe(true);
  });

  it('is not configured when untouched and nothing is stored', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: undefined,
        storedValue: '',
      }),
    ).toBe(false);
  });

  it('is configured as soon as a value is typed', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: 'new-key',
        storedValue: '',
      }),
    ).toBe(true);
  });

  // Guards the backfill gate against a cleared field whose save is still in
  // flight: the stored credential is still present but must not count.
  it('is not configured once a stored value is cleared', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: '',
        storedValue: 'dem********',
      }),
    ).toBe(false);
  });
});
