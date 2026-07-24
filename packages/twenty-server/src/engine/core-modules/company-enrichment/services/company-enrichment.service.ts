import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichmentResult } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { COMPANY_ENRICHMENT_THROTTLE_MAX_REQUESTS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-max-requests.constant';
import { COMPANY_ENRICHMENT_THROTTLE_WINDOW_MS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-window-ms.constant';
import { PeopleDataLabsCompanyClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-company-client.service';
import {
  COMPANY_ENRICHMENT_ATTEMPT_KEY,
  type CompanyEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-attempt-key-value.type';
import { type PeopleDataLabsCompanyEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-enrich-result.type';
import { toWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-company-enrichment.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { isWorkDomain } from 'src/utils/is-work-email';

@Injectable()
export class CompanyEnrichmentService {
  private readonly logger = new Logger(CompanyEnrichmentService.name);

  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly peopleDataLabsCompanyClientService: PeopleDataLabsCompanyClientService,
    private readonly throttlerService: ThrottlerService,
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
  }): Promise<WorkspaceCompanyEnrichmentResult> {
    const isWorkspaceCreator = await this.isWorkspaceCreator({
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

    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `company-enrichment:throttler:${workspaceId}`,
        1,
        COMPANY_ENRICHMENT_THROTTLE_MAX_REQUESTS,
        COMPANY_ENRICHMENT_THROTTLE_WINDOW_MS,
      );
    } catch (error) {
      if (
        error instanceof ThrottlerException &&
        error.code === ThrottlerExceptionCode.LIMIT_REACHED
      ) {
        return { outcome: 'transientError', enrichment: null };
      }

      throw error;
    }

    const result =
      await this.peopleDataLabsCompanyClientService.enrichCompanyByDomain(
        domain,
      );

    const enrichmentResult = this.resolveEnrichmentResult({
      result,
      workspaceId,
      domain,
    });

    // 'skipped' means the feature is disabled (no API key); don't persist the domain in that case.
    if (result.outcome !== 'skipped') {
      await this.recordEnrichmentAttempt({
        workspaceId,
        domain,
        outcome: enrichmentResult.outcome,
      });
    }

    return enrichmentResult;
  }

  private resolveEnrichmentResult({
    result,
    workspaceId,
    domain,
  }: {
    result: PeopleDataLabsCompanyEnrichResult;
    workspaceId: string;
    domain: string;
  }): WorkspaceCompanyEnrichmentResult {
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

    return {
      outcome: 'matched',
      enrichment: toWorkspaceCompanyEnrichment({
        domain,
        data: result.data,
        enrichedAt: new Date(),
      }),
    };
  }

  private async recordEnrichmentAttempt({
    workspaceId,
    domain,
    outcome,
  }: {
    workspaceId: string;
    domain: string;
    outcome: WorkspaceCompanyEnrichmentResult['outcome'];
  }): Promise<void> {
    // Best-effort telemetry: never let a key-value write failure fail the enrichment.
    try {
      await this.keyValuePairService.set({
        userId: null,
        workspaceId,
        key: COMPANY_ENRICHMENT_ATTEMPT_KEY,
        value: { domain, outcome, attemptedAt: new Date().toISOString() },
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

  private async isWorkspaceCreator({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const earliestUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'ASC' },
    });

    return earliestUserWorkspace?.userId === userId;
  }
}
