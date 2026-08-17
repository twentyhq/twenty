import { DEFAULT_CALLER_NAME } from 'twenty-shared/application';

import { getCaller } from '@/sdk/logic-function/caller/get-caller';

describe('getCaller', () => {
  afterEach(() => {
    delete process.env[DEFAULT_CALLER_NAME];
  });

  it('should return null when no caller is set', () => {
    expect(getCaller()).toBeNull();
  });

  it('should parse a user caller', () => {
    process.env[DEFAULT_CALLER_NAME] = JSON.stringify({
      kind: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(getCaller()).toEqual({
      kind: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workspaceMemberId: 'workspace-member-1',
    });
  });

  it('should parse an api key caller', () => {
    process.env[DEFAULT_CALLER_NAME] = JSON.stringify({
      kind: 'apiKey',
      apiKeyId: 'api-key-1',
    });

    expect(getCaller()).toEqual({ kind: 'apiKey', apiKeyId: 'api-key-1' });
  });

  it('should return null for malformed content', () => {
    process.env[DEFAULT_CALLER_NAME] = 'not-json';

    expect(getCaller()).toBeNull();
  });
});
