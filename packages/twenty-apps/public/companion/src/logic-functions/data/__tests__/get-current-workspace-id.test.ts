import { afterEach, describe, expect, it } from 'vitest';

import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';

const APP_ACCESS_TOKEN_ENV_VAR_NAME = 'TWENTY_APP_ACCESS_TOKEN';
const ORIGINAL_APP_ACCESS_TOKEN = process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME];
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const restoreOriginalAppAccessToken = () => {
  if (ORIGINAL_APP_ACCESS_TOKEN === undefined) {
    delete process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME];

    return;
  }

  process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME] = ORIGINAL_APP_ACCESS_TOKEN;
};

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

describe('getCurrentWorkspaceId', () => {
  afterEach(() => {
    restoreOriginalAppAccessToken();
  });

  it('reads the workspace id from the app access token payload', () => {
    process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME] = buildAccessToken({
      workspaceId: WORKSPACE_ID,
    });

    expect(getCurrentWorkspaceId()).toBe(WORKSPACE_ID);
  });
});
