/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/custom-ai-provider-access-refresh-interval.constant';
import { CUSTOM_AI_PROVIDER_ACCESS_RETRY_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/custom-ai-provider-access-retry-interval.constant';
import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { hasCustomAiProviderAccess } from 'src/engine/core-modules/enterprise/utils/has-custom-ai-provider-access.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type CustomAiProviderAccess = {
  hasAccess: boolean;
  seatCount: number;
  seatThreshold: number;
};

@Injectable()
export class CustomAiProviderAccessService {
  private readonly logger = new Logger(CustomAiProviderAccessService.name);

  // Assumed granted until the first count returns, so a cold process never drops
  // an entitled instance's custom models while the query is still in flight.
  private hasAccess = true;
  private lastRefreshStartedAt: number | null = null;
  private didLastRefreshFail = false;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  async computeAccess(): Promise<CustomAiProviderAccess> {
    // Stamped before the first await so concurrent synchronous readers cannot
    // each start their own count.
    this.lastRefreshStartedAt = Date.now();

    try {
      const seatCount = await this.enterprisePlanService.getBillableSeatCount();

      this.hasAccess = hasCustomAiProviderAccess({
        isBillingEnabled: this.twentyConfigService.get('IS_BILLING_ENABLED'),
        hasValidEnterprisePlan: this.enterprisePlanService.isValid(),
        seatCount,
      });
      this.didLastRefreshFail = false;

      return {
        hasAccess: this.hasAccess,
        seatCount,
        seatThreshold: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      };
    } catch (error) {
      this.didLastRefreshFail = true;

      throw error;
    }
  }

  // Callers on the inference path resolve models synchronously and must not wait
  // on a seat count, so they get the last verdict and only start a refresh once
  // it has aged out — whoever reads next picks the new one up.
  getCachedHasAccess(): boolean {
    if (this.isVerdictStale()) {
      // computeAccess stamps the clock before its first await, so a second
      // synchronous caller cannot start a competing count.
      this.computeAccess().catch((error) => {
        // A count that fails must never disable AI: the previous verdict stands
        // until a later refresh succeeds.
        this.logger.warn(
          `Could not refresh custom AI provider access: ${
            error instanceof Error ? error.message : 'Unknown error'
          }. Keeping the previous verdict.`,
        );
      });
    }

    return this.hasAccess;
  }

  private isVerdictStale(): boolean {
    if (!isDefined(this.lastRefreshStartedAt)) {
      return true;
    }

    const refreshInterval = this.didLastRefreshFail
      ? CUSTOM_AI_PROVIDER_ACCESS_RETRY_INTERVAL_MS
      : CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS;

    return Date.now() - this.lastRefreshStartedAt >= refreshInterval;
  }
}
