import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';

describe('getApplicationVariableValue', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the value injected into the front component synchronously', () => {
    vi.stubEnv(
      'applicationVariables',
      JSON.stringify({ RECORDER_NAME: 'Meeting assistant' }),
    );

    expect(getApplicationVariableValue('RECORDER_NAME')).toBe(
      'Meeting assistant',
    );
  });

  it('returns an empty value when the variable is not configured', () => {
    vi.stubEnv('applicationVariables', '{}');

    expect(getApplicationVariableValue('RECORDER_NAME')).toBe('');
  });
});
