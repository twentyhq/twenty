import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageException } from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { HTTP_EGRESS_BURST_DIVISOR } from 'src/engine/core-modules/http-egress/constants/http-egress-burst-divisor.constant';
import { HTTP_EGRESS_SUSPENSION_WINDOW_MS } from 'src/engine/core-modules/http-egress/constants/http-egress-suspension-window-ms.constant';
import { type HttpEgressAdmission } from 'src/engine/core-modules/http-egress/types/http-egress-admission.type';
import { type HttpEgressRejection } from 'src/engine/core-modules/http-egress/types/http-egress-rejection.type';
import { type OutboundRequestSource } from 'src/engine/core-modules/secure-http-client/outbound-request-source.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type HttpEgressRateBucket = {
  reason: HttpEgressRejection['reason'];
  key: string;
  burst: number;
  refillPerWindow: number;
  windowMs: number;
};

@Injectable()
export class HttpEgressAdmissionService {
  private readonly logger = new Logger(HttpEgressAdmissionService.name);

  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingCreditAllowanceService: BillingCreditAllowanceService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async admit({
    workspaceId,
    userWorkspaceId,
    source,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    source: OutboundRequestSource;
  }): Promise<HttpEgressAdmission> {
    const isEnforced =
      source === 'workflow-http-test' ||
      this.twentyConfigService.get('HTTP_EGRESS_ENFORCE_STEP_LIMITS');

    try {
      if (await this.isSuspended(workspaceId)) {
        return { rejection: { reason: 'suspended' }, isEnforced };
      }

      const rejection = await this.consumeRateLimits({
        workspaceId,
        userWorkspaceId,
        source,
      });

      return { rejection, isEnforced };
    } catch (error) {
      if (!(error instanceof CacheStorageException)) {
        throw error;
      }

      this.logger.error(
        `HTTP egress limits unavailable, admitting request: ${error.message}`,
      );

      return { rejection: null, isEnforced };
    }
  }

  async recordBlockedRequest(workspaceId: string): Promise<void> {
    const blockedRequestsBeforeSuspension = this.twentyConfigService.get(
      'HTTP_EGRESS_BLOCKED_REQUESTS_BEFORE_SUSPENSION',
    );

    try {
      const admittedCount = await this.throttlerService.tokenBucketConsumeUpTo(
        `http-egress:blocked:${workspaceId}`,
        1,
        blockedRequestsBeforeSuspension,
        HTTP_EGRESS_SUSPENSION_WINDOW_MS,
      );

      if (admittedCount > 0) {
        return;
      }

      await this.cacheStorage.set(
        this.getSuspensionKey(workspaceId),
        true,
        HTTP_EGRESS_SUSPENSION_WINDOW_MS,
      );

      this.logger.warn(
        `Suspended user-controlled HTTP requests for workspace ${workspaceId} after ${blockedRequestsBeforeSuspension} requests blocked by the SSRF guard`,
      );
    } catch (error) {
      if (!(error instanceof CacheStorageException)) {
        throw error;
      }

      this.logger.error(
        `Could not record blocked HTTP request for workspace ${workspaceId}: ${error.message}`,
      );
    }
  }

  private async isSuspended(workspaceId: string): Promise<boolean> {
    const isSuspended = await this.cacheStorage.get<boolean>(
      this.getSuspensionKey(workspaceId),
    );

    return isSuspended === true;
  }

  private getSuspensionKey(workspaceId: string): string {
    return `http-egress:suspended:${workspaceId}`;
  }

  private async consumeRateLimits({
    workspaceId,
    userWorkspaceId,
    source,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    source: OutboundRequestSource;
  }): Promise<HttpEgressRejection | null> {
    const buckets = await this.buildRateBuckets({
      workspaceId,
      userWorkspaceId,
      source,
    });

    const [admittedCount, exhaustedBucketPosition, retryAfterMs] =
      await this.throttlerService.tryConsumeTokenBuckets({
        buckets,
        tokensToConsume: 1,
        allowPartial: false,
      });

    if (admittedCount === 1) {
      return null;
    }

    const exhaustedBucket = buckets[exhaustedBucketPosition - 1];

    return {
      reason: exhaustedBucket?.reason ?? 'workspace-rate',
      retryAfterMs,
    };
  }

  // Narrowest scope first: the throttler names the first exhausted bucket.
  private async buildRateBuckets({
    workspaceId,
    userWorkspaceId,
    source,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    source: OutboundRequestSource;
  }): Promise<HttpEgressRateBucket[]> {
    const windowMs = this.twentyConfigService.get('HTTP_EGRESS_THROTTLE_TTL');

    const buildBucket = (
      reason: HttpEgressRejection['reason'],
      spenderId: string,
      limit: number,
    ): HttpEgressRateBucket => ({
      reason,
      key: `http-egress:${reason}:${spenderId}`,
      burst: Math.max(1, Math.ceil(limit / HTTP_EGRESS_BURST_DIVISOR)),
      refillPerWindow: limit,
      windowMs,
    });

    const isTestRequest = source === 'workflow-http-test';
    const buckets: HttpEgressRateBucket[] = [];

    if (isDefined(userWorkspaceId) && isTestRequest) {
      buckets.push(
        buildBucket(
          'test-user-rate',
          userWorkspaceId,
          this.twentyConfigService.get('HTTP_EGRESS_TEST_USER_THROTTLE_LIMIT'),
        ),
      );
    }

    if (isDefined(userWorkspaceId) && source === 'agent-http-tool') {
      buckets.push(
        buildBucket(
          'agent-user-rate',
          userWorkspaceId,
          this.twentyConfigService.get('HTTP_EGRESS_AGENT_USER_THROTTLE_LIMIT'),
        ),
      );
    }

    if (await this.isTrialWorkspace(workspaceId)) {
      buckets.push(
        buildBucket(
          'trial-workspace-rate',
          workspaceId,
          this.twentyConfigService.get(
            'HTTP_EGRESS_TRIAL_WORKSPACE_THROTTLE_LIMIT',
          ),
        ),
      );
    }

    buckets.push(
      isTestRequest
        ? buildBucket(
            'test-workspace-rate',
            workspaceId,
            this.twentyConfigService.get(
              'HTTP_EGRESS_TEST_WORKSPACE_THROTTLE_LIMIT',
            ),
          )
        : buildBucket(
            'workspace-rate',
            workspaceId,
            this.twentyConfigService.get(
              'HTTP_EGRESS_WORKSPACE_THROTTLE_LIMIT',
            ),
          ),
    );

    return buckets;
  }

  private async isTrialWorkspace(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return false;
    }

    const subscriptionPlan =
      await this.billingCreditAllowanceService.getSubscriptionPlan(workspaceId);

    return !isDefined(subscriptionPlan) || subscriptionPlan.isTrialing;
  }
}
