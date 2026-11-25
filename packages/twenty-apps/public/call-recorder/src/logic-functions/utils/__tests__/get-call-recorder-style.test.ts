import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCallRecorderStyle } from 'src/logic-functions/utils/get-call-recorder-style.util';

describe('getCallRecorderStyle', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the configured style', () => {
    vi.stubEnv('CALL_RECORDER_STYLE', ' WORKSPACE ');

    expect(getCallRecorderStyle()).toBe('WORKSPACE');
  });

  it.each(['', 'workspace', 'LOGO'])(
    'falls back to the Twenty style for %j',
    (value) => {
      vi.stubEnv('CALL_RECORDER_STYLE', value);

      expect(getCallRecorderStyle()).toBe('TWENTY');
    },
  );
});
