import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspaceEnrichmentResult,
} from 'twenty-shared/workspace';

import { COMPANY_ENRICHMENT_THROTTLE_MAX_REQUESTS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-max-requests.constant';
import { COMPANY_ENRICHMENT_THROTTLE_WINDOW_MS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-window-ms.constant';
import { EnrichmentThrottleService } from 'src/engine/core-modules/company-enrichment/services/enrichment-throttle.service';
import { PeopleDataLabsClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-client.service';
import {
  COMPANY_ENRICHMENT_ATTEMPT_KEY,
  type CompanyEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-attempt-key-value.type';
import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';
import { type PeopleDataLabsEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-enrich-result.type';
import { toWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-company-enrichment.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { readIsCompanyEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-company-enrichment-enabled.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { isWorkDomain } from 'src/utils/is-work-email';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class CompanyEnrichmentService {
  private readonly logger = new Logger(CompanyEnrichmentService.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly peopleDataLabsClientService: PeopleDataLabsClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly enrichmentThrottleService: EnrichmentThrottleService,
    private readonly keyValuePairService: KeyValuePairService<CompanyEnrichmentAttemptKeyValueTypeMap>,
  ) {}

  async enrichCompanyForWorkspaceCreator({
    userId,
    email,
    workspaceId,
  }: {
    userId: string;
    email: string;
    workspaceId: string;
  }): Promise<WorkspaceEnrichmentResult<WorkspaceCompanyEnrichment>> {
    if (!this.hasEnrichmentConsumer()) {
      return { outcome: 'unavailable', enrichment: null };
    }

    const isWorkspaceCreator =
      await this.userWorkspaceService.isWorkspaceCreator({
        userId,
        workspaceId,
      });

    if (!isWorkspaceCreator) {
      return { outcome: 'unavailable', enrichment: null };
    }

    const domain = getDomainFromEmail(email)?.toLowerCase();

    if (!isNonEmptyString(domain) || !isWorkDomain(domain)) {
      return { outcome: 'unavailable', enrichment: null };
    }

    // Checked before throttling so a disabled feature never burns a throttle token.
    if (!this.peopleDataLabsClientService.isEnabled()) {
      return { outcome: 'unavailable', enrichment: null };
    }

    const throttleOutcome = await this.enrichmentThrottleService.consumeToken({
      throttleKey: `company-enrichment:throttler:${workspaceId}`,
      maxRequests: COMPANY_ENRICHMENT_THROTTLE_MAX_REQUESTS,
      windowMs: COMPANY_ENRICHMENT_THROTTLE_WINDOW_MS,
    });

    if (throttleOutcome === 'limitReached') {
      return { outcome: 'transientError', enrichment: null };
    }

    const result =
      await this.peopleDataLabsClientService.enrichCompanyByDomain(domain);

    const enrichmentResult = this.resolveEnrichmentResult({
      result,
      workspaceId,
      domain,
    });

    // 'skipped' means the feature is disabled (no API key); don't persist the domain in that case.
    if (result.outcome !== 'skipped') {
      await this.recordEnrichmentAttempt({ workspaceId, domain, result });
    }

    return enrichmentResult;
  }

  private hasEnrichmentConsumer(): boolean {
    return readIsCompanyEnrichmentEnabled(this.twentyConfigService);
  }

  private resolveEnrichmentResult({
    result,
    workspaceId,
    domain,
  }: {
    result: PeopleDataLabsEnrichResult<PeopleDataLabsCompanyData>;
    workspaceId: string;
    domain: string;
  }): WorkspaceEnrichmentResult<WorkspaceCompanyEnrichment> {
    if (result.outcome === 'transientError') {
      this.logger.warn(
        `Company enrichment transiently failed for workspace ${workspaceId} (${domain}): ${result.message}`,
      );

      return { outcome: 'transientError', enrichment: null };
    }

    if (result.outcome !== 'matched') {
      if (result.outcome === 'permanentError') {
        this.logger.warn(
          `Company enrichment permanently failed for workspace ${workspaceId} (${domain}): ${result.message} (HTTP ${result.httpStatus})`,
        );
      }

      return { outcome: 'unavailable', enrichment: null };
    }

    const enrichment = toWorkspaceCompanyEnrichment({
      domain,
      data: result.data,
      enrichedAt: new Date(),
    });

    if (!isDefined(enrichment)) {
      return { outcome: 'unavailable', enrichment: null };
    }

    return { outcome: 'matched', enrichment };
  }

  private async recordEnrichmentAttempt({
    workspaceId,
    domain,
    result,
  }: {
    workspaceId: string;
    domain: string;
    result: Exclude<
      PeopleDataLabsEnrichResult<PeopleDataLabsCompanyData>,
      { outcome: 'skipped' }
    >;
  }): Promise<void> {
    // Best-effort telemetry: never let a key-value write failure fail the enrichment.
    // The pre-collapse outcome is recorded so an operator can tell "no PDL match for this
    // domain" apart from "the PDL integration is broken" (both surface as 'unavailable').
    try {
      await this.keyValuePairService.set({
        userId: null,
        workspaceId,
        key: COMPANY_ENRICHMENT_ATTEMPT_KEY,
        value: {
          domain,
          outcome: result.outcome,
          ...('httpStatus' in result
            ? { httpStatus: result.httpStatus, message: result.message }
            : {}),
          attemptedAt: new Date().toISOString(),
        },
        type: KeyValuePairType.CONFIG_VARIABLE,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to record company enrichment attempt for workspace ${workspaceId} (${domain}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
