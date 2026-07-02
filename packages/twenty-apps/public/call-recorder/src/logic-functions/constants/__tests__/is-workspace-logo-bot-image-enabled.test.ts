import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { isWorkspaceLogoBotImageEnabled } from 'src/logic-functions/constants/is-workspace-logo-bot-image-enabled';

const ORIGINAL_VALUE =
  process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME];

const restore = () => {
  if (ORIGINAL_VALUE === undefined) {
    delete process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME];

    return;
  }

  process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME] = ORIGINAL_VALUE;
};

describe('isWorkspaceLogoBotImageEnabled', () => {
  afterEach(() => {
    restore();
  });

  it('defaults to enabled when unset', () => {
    delete process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME];

    expect(isWorkspaceLogoBotImageEnabled()).toBe(true);
  });

  it.each(['false', '0', 'no', 'off', 'FALSE', ' Off '])(
    'is disabled for falsy value %s',
    (value) => {
      process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME] = value;

      expect(isWorkspaceLogoBotImageEnabled()).toBe(false);
    },
  );

  it.each(['true', '1', 'yes', 'on', 'TRUE'])(
    'is enabled for truthy value %s',
    (value) => {
      process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME] = value;

      expect(isWorkspaceLogoBotImageEnabled()).toBe(true);
    },
  );

  it('defaults to enabled for an unrecognized value', () => {
    process.env[CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME] = 'maybe';

    expect(isWorkspaceLogoBotImageEnabled()).toBe(true);
  });
});
