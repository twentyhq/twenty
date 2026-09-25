import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';

describe('FeatureFlagGuard', () => {
  const executionContext = {} as ExecutionContext;
  let isFeatureEnabled: jest.Mock;
  let request: { workspace?: { id: string } };

  const canActivate = () => {
    const GuardClass = FeatureFlagGuard(
      FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
    );
    const guard = new GuardClass({
      isFeatureEnabled,
    } as unknown as FeatureFlagService);

    return guard.canActivate(executionContext);
  };

  beforeEach(() => {
    isFeatureEnabled = jest.fn();
    request = { workspace: { id: 'workspace-id' } };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: request }),
    } as unknown as GqlExecutionContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow the request when the flag is enabled for the workspace', async () => {
    isFeatureEnabled.mockResolvedValue(true);

    await expect(canActivate()).resolves.toBe(true);
    expect(isFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      'workspace-id',
    );
  });

  it('should throw when the flag is disabled for the workspace', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    await expect(canActivate()).rejects.toThrow(ForbiddenException);
  });

  it('should deny the request without checking the flag when there is no workspace', async () => {
    request = {};

    await expect(canActivate()).resolves.toBe(false);
    expect(isFeatureEnabled).not.toHaveBeenCalled();
  });
});
