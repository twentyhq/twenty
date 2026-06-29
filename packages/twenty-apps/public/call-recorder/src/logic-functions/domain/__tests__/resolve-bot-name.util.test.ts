import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { DEFAULT_CALL_RECORDER_NAME } from 'src/logic-functions/constants/default-call-recorder-name';
import { resolveBotName } from 'src/logic-functions/domain/resolve-bot-name.util';

const getWorkspaceDisplayNameMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/get-workspace-display-name.util', () => ({
  getWorkspaceDisplayName: getWorkspaceDisplayNameMock,
}));

const ORIGINAL_NAME = process.env[CALL_RECORDER_NAME_ENV_VAR_NAME];

const restore = () => {
  if (ORIGINAL_NAME === undefined) {
    delete process.env[CALL_RECORDER_NAME_ENV_VAR_NAME];

    return;
  }

  process.env[CALL_RECORDER_NAME_ENV_VAR_NAME] = ORIGINAL_NAME;
};

describe('resolveBotName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env[CALL_RECORDER_NAME_ENV_VAR_NAME];
  });

  afterEach(() => {
    restore();
  });

  it('uses the configured name verbatim and skips the workspace lookup', async () => {
    process.env[CALL_RECORDER_NAME_ENV_VAR_NAME] = '  Acme Notetaker  ';

    expect(await resolveBotName()).toBe('Acme Notetaker');
    expect(getWorkspaceDisplayNameMock).not.toHaveBeenCalled();
  });

  it('names the bot after the workspace when no name is configured', async () => {
    getWorkspaceDisplayNameMock.mockResolvedValue('Acme');

    expect(await resolveBotName()).toBe(`${DEFAULT_CALL_RECORDER_NAME} (Acme)`);
  });

  it('falls back to the default name when the workspace name is unavailable', async () => {
    getWorkspaceDisplayNameMock.mockResolvedValue(undefined);

    expect(await resolveBotName()).toBe(DEFAULT_CALL_RECORDER_NAME);
  });
});
