import { ForbiddenException } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { runGuardedQuery } from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';

describe('FeatureFlagGuard', () => {
  let isFeatureEnabled: jest.Mock;

  const runQuery = (request: Record<string, unknown>) =>
    runGuardedQuery({
      guard: FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED),
      request,
      providers: [
        { provide: FeatureFlagService, useValue: { isFeatureEnabled } },
      ],
    });

  beforeEach(() => {
    isFeatureEnabled = jest.fn();
  });

  it('should let the request through when the flag is enabled for the workspace', async () => {
    isFeatureEnabled.mockResolvedValue(true);

    const result = await runQuery({ workspace: { id: 'workspace-id' } });

    expect(result.errors).toBeUndefined();
    expect(result.data?.guardedQuery).toBe('ok');
    expect(isFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      'workspace-id',
    );
  });

  it('should refuse the request when the flag is disabled for the workspace', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    const result = await runQuery({ workspace: { id: 'workspace-id' } });

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
    expect(result.errors?.[0]?.message).toBe(
      `Feature flag "${FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED}" is not enabled for this workspace`,
    );
  });

  it('should refuse the request without checking the flag when there is no workspace', async () => {
    const result = await runQuery({});

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      ForbiddenException,
    );
    expect(result.errors?.[0]?.message).toBe('Forbidden resource');
    expect(isFeatureEnabled).not.toHaveBeenCalled();
  });
});
