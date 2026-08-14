import { describe, expect, it } from 'vitest';

import { getIsApplicationVariableConfigured } from 'src/front-components/utils/get-is-application-variable-configured.util';

describe('getIsApplicationVariableConfigured', () => {
  it('is configured when untouched and a value is stored', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: undefined,
        savedValue: undefined,
        storedValue: 'dem********',
      }),
    ).toBe(true);
  });

  it('is not configured when untouched and nothing is stored', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: undefined,
        savedValue: undefined,
        storedValue: '',
      }),
    ).toBe(false);
  });

  it('is not configured while a typed value has not been saved yet', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: 'new-key',
        savedValue: undefined,
        storedValue: '',
      }),
    ).toBe(false);
  });

  it('is configured once the typed value has been saved', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: 'new-key',
        savedValue: 'new-key',
        storedValue: '',
      }),
    ).toBe(true);
  });

  it('is not configured again while an edit to a saved value is still pending', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: 'new-key-edited',
        savedValue: 'new-key',
        storedValue: '',
      }),
    ).toBe(false);
  });

  it('is not configured once a stored value is cleared, even while the stored value is still present', () => {
    expect(
      getIsApplicationVariableConfigured({
        draftValue: '',
        savedValue: 'previous-key',
        storedValue: 'dem********',
      }),
    ).toBe(false);
  });
});
