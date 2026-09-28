import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackRemoveChannelRuleHandler } from 'src/logic-functions/handlers/slack-remove-channel-rule-handler';

const {
  coreApiClientMock,
  currentUserHasRolesPermissionMock,
  destroySlackChannelRuleMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  currentUserHasRolesPermissionMock: vi.fn(),
  destroySlackChannelRuleMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: currentUserHasRolesPermissionMock,
}));

vi.mock('src/logic-functions/data/destroy-slack-channel-rule', () => ({
  destroySlackChannelRule: destroySlackChannelRuleMock,
}));

const buildPayload = (body: unknown) => ({ body });

describe('slackRemoveChannelRuleHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    currentUserHasRolesPermissionMock.mockResolvedValue(true);
    destroySlackChannelRuleMock.mockResolvedValue(undefined);
  });

  it('should require an id', async () => {
    const result = await slackRemoveChannelRuleHandler(buildPayload({}));

    expect(result.success).toBe(false);
    expect(result.error).toBe('id is required.');
    expect(destroySlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should refuse when the user lacks the roles permission', async () => {
    currentUserHasRolesPermissionMock.mockResolvedValue(false);

    const result = await slackRemoveChannelRuleHandler(
      buildPayload({ id: 'rule-1' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Not allowed');
    expect(destroySlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should destroy the rule as the application', async () => {
    const result = await slackRemoveChannelRuleHandler(
      buildPayload({ id: 'rule-1' }),
    );

    expect(result.success).toBe(true);
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(destroySlackChannelRuleMock).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'rule-1' },
    );
  });

  it('should fail with a structured result when the destroy errors', async () => {
    destroySlackChannelRuleMock.mockRejectedValue(new Error('not found'));

    const result = await slackRemoveChannelRuleHandler(
      buildPayload({ id: 'rule-1' }),
    );

    expect(result).toEqual({
      success: false,
      message: 'Could not remove the rule',
      error: 'not found',
    });
  });
});
