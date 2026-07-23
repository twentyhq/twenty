import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichmentResult } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { COMPANY_ENRICHMENT_THROTTLE_MAX_REQUESTS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-max-requests.constant';
import { COMPANY_ENRICHMENT_THROTTLE_WINDOW_MS } from 'src/engine/core-modules/company-enrichment/constants/company-enrichment-throttle-window-ms.constant';
import { PeopleDataLabsCompanyClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-company-client.service';
import { toWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-company-enrichment.util';
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

    return { outcome: 'matched', enrichment };
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
