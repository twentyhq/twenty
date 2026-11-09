import { type BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import {
  CacheStorageException,
  CacheStorageExceptionCode,
} from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { HttpEgressAdmissionService } from 'src/engine/core-modules/http-egress/services/http-egress-admission.service';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CONFIG: Record<string, unknown> = {
  IS_BILLING_ENABLED: false,
  HTTP_EGRESS_ENFORCE_STEP_LIMITS: false,
  HTTP_EGRESS_TEST_USER_THROTTLE_LIMIT: 60,
  HTTP_EGRESS_TEST_WORKSPACE_THROTTLE_LIMIT: 200,
  HTTP_EGRESS_AGENT_USER_THROTTLE_LIMIT: 300,
  HTTP_EGRESS_WORKSPACE_THROTTLE_LIMIT: 5000,
  HTTP_EGRESS_TRIAL_WORKSPACE_THROTTLE_LIMIT: 200,
  HTTP_EGRESS_THROTTLE_TTL: 3_600_000,
  HTTP_EGRESS_BLOCKED_REQUESTS_BEFORE_SUSPENSION: 20,
};

describe('HttpEgressAdmissionService', () => {
  let service: HttpEgressAdmissionService;
  let config: Record<string, unknown>;
  let throttlerService: {
    tryConsumeTokenBuckets: jest.Mock;
    tokenBucketConsumeUpTo: jest.Mock;
  };
  let billingCreditAllowanceService: { getSubscriptionPlan: jest.Mock };
  let cacheStorage: { get: jest.Mock; set: jest.Mock };

  const admit = (
    source: 'workflow-http-test' | 'workflow-http' | 'agent-http-tool',
    userWorkspaceId: string | undefined = 'user-workspace-1',
  ) =>
    service.admit({
      workspaceId: 'workspace-1',
      userWorkspaceId,
      source,
    });

  const getConsumedBucketKeys = (): string[] =>
    throttlerService.tryConsumeTokenBuckets.mock.calls[0][0].buckets.map(
      (bucket: { key: string }) => bucket.key,
    );

  beforeEach(() => {
    config = { ...CONFIG };
    throttlerService = {
      tryConsumeTokenBuckets: jest.fn().mockResolvedValue([1, 0, 0]),
      tokenBucketConsumeUpTo: jest.fn().mockResolvedValue(1),
    };
    billingCreditAllowanceService = {
      getSubscriptionPlan: jest.fn().mockResolvedValue(null),
    };
    cacheStorage = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };

    service = new HttpEgressAdmissionService(
      throttlerService as unknown as ThrottlerService,
      { get: (key: string) => config[key] } as unknown as TwentyConfigService,
      billingCreditAllowanceService as unknown as BillingCreditAllowanceService,
      cacheStorage as unknown as CacheStorageService,
    );
  });

  describe('rate buckets', () => {
    it('should limit test requests per user and per workspace', async () => {
      const admission = await admit('workflow-http-test');

      expect(admission).toMatchObject({ rejection: null, isEnforced: true });
      expect(getConsumedBucketKeys()).toEqual([
        'http-egress:test-user-rate:user-workspace-1',
        'http-egress:test-workspace-rate:workspace-1',
      ]);
    });

    it('should spend a third of the window allowance at once at most', async () => {
      await admit('workflow-http-test');

      expect(
        throttlerService.tryConsumeTokenBuckets.mock.calls[0][0].buckets[0],
      ).toMatchObject({ burst: 20, refillPerWindow: 60, windowMs: 3_600_000 });
    });

    it('should limit agent requests per user and per workspace', async () => {
      await admit('agent-http-tool');

      expect(getConsumedBucketKeys()).toEqual([
        'http-egress:agent-user-rate:user-workspace-1',
        'http-egress:workspace-rate:workspace-1',
      ]);
    });

    it('should limit workflow steps per workspace only', async () => {
      await admit('workflow-http', undefined);

      expect(getConsumedBucketKeys()).toEqual([
        'http-egress:workspace-rate:workspace-1',
      ]);
    });

    it('should add a trial bucket before the workspace bucket for trialing workspaces', async () => {
      config.IS_BILLING_ENABLED = true;
      billingCreditAllowanceService.getSubscriptionPlan.mockResolvedValue({
        planKey: 'PRO',
        isTrialing: true,
      });

      await admit('workflow-http');

      expect(getConsumedBucketKeys()).toEqual([
        'http-egress:trial-workspace-rate:workspace-1',
        'http-egress:workspace-rate:workspace-1',
      ]);
    });

    it('should treat a workspace without subscription as trialing when billing is enabled', async () => {
      config.IS_BILLING_ENABLED = true;

      await admit('workflow-http');

      expect(getConsumedBucketKeys()).toContain(
        'http-egress:trial-workspace-rate:workspace-1',
      );
    });

    it('should not add a trial bucket for paying workspaces', async () => {
      config.IS_BILLING_ENABLED = true;
      billingCreditAllowanceService.getSubscriptionPlan.mockResolvedValue({
        planKey: 'PRO',
        isTrialing: false,
      });

      await admit('workflow-http');

      expect(getConsumedBucketKeys()).not.toContain(
        'http-egress:trial-workspace-rate:workspace-1',
      );
    });
  });

  describe('enforcement', () => {
    it('should reject an exhausted test request', async () => {
      throttlerService.tryConsumeTokenBuckets.mockResolvedValue([0, 1, 42_000]);

      const admission = await admit('workflow-http-test');

      expect(admission).toEqual({
        rejection: { reason: 'test-user-rate', retryAfterMs: 42_000 },
        isEnforced: true,
      });
    });

    it('should only report an exhausted step request while step limits are not enforced', async () => {
      throttlerService.tryConsumeTokenBuckets.mockResolvedValue([0, 1, 1_000]);

      const admission = await admit('workflow-http');

      expect(admission).toEqual({
        rejection: { reason: 'workspace-rate', retryAfterMs: 1_000 },
        isEnforced: false,
      });
    });

    it('should enforce step limits once enabled', async () => {
      config.HTTP_EGRESS_ENFORCE_STEP_LIMITS = true;
      throttlerService.tryConsumeTokenBuckets.mockResolvedValue([0, 1, 1_000]);

      const admission = await admit('workflow-http');

      expect(admission.isEnforced).toBe(true);
    });
  });

  describe('suspension', () => {
    it('should reject a suspended workspace without spending rate tokens', async () => {
      cacheStorage.get.mockResolvedValue(true);

      const admission = await admit('workflow-http-test');

      expect(admission.rejection).toEqual({ reason: 'suspended' });
      expect(throttlerService.tryConsumeTokenBuckets).not.toHaveBeenCalled();
    });

    it('should not suspend while blocked requests stay under the threshold', async () => {
      await service.recordBlockedRequest('workspace-1');

      expect(throttlerService.tokenBucketConsumeUpTo).toHaveBeenCalledWith(
        'http-egress:blocked:workspace-1',
        1,
        20,
        24 * 60 * 60 * 1000,
      );
      expect(cacheStorage.set).not.toHaveBeenCalled();
    });

    it('should suspend for 24 hours once the threshold is reached', async () => {
      throttlerService.tokenBucketConsumeUpTo.mockResolvedValue(0);

      await service.recordBlockedRequest('workspace-1');

      expect(cacheStorage.set).toHaveBeenCalledWith(
        'http-egress:suspended:workspace-1',
        true,
        24 * 60 * 60 * 1000,
      );
    });
  });

  describe('cache failures', () => {
    it('should admit the request when the cache cannot run scripts', async () => {
      throttlerService.tryConsumeTokenBuckets.mockRejectedValue(
        new CacheStorageException(
          'runScript is only supported with Redis cache',
          CacheStorageExceptionCode.REDIS_CACHE_REQUIRED,
        ),
      );

      const admission = await admit('workflow-http-test');

      expect(admission.rejection).toBeNull();
    });
  });
});
