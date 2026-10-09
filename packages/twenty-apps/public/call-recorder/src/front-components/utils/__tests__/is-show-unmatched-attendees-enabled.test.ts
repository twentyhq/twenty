import { afterEach, describe, expect, it, vi } from 'vitest';

import { isShowUnmatchedAttendeesEnabled } from 'src/front-components/utils/is-show-unmatched-attendees-enabled.util';
import { CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-show-unmatched-attendees-env-var-name';

const stubShowUnmatchedAttendees = (value: string) =>
  vi.stubEnv(
    'applicationVariables',
    JSON.stringify({
      [CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ENV_VAR_NAME]: value,
    }),
  );

describe('isShowUnmatchedAttendeesEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is off when the variable is not configured', () => {
    vi.stubEnv('applicationVariables', '{}');

    expect(isShowUnmatchedAttendeesEnabled()).toBe(false);
  });

  it('is on when the variable is true', () => {
    stubShowUnmatchedAttendees('true');

    expect(isShowUnmatchedAttendeesEnabled()).toBe(true);
  });

  it('is off when the variable is false', () => {
    stubShowUnmatchedAttendees('false');

    expect(isShowUnmatchedAttendeesEnabled()).toBe(false);
  });

  it('falls back to off for an unrecognized value', () => {
    stubShowUnmatchedAttendees('sometimes');

    expect(isShowUnmatchedAttendeesEnabled()).toBe(false);
  });
});
