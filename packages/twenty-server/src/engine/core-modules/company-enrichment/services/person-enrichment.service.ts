import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceEnrichmentResult,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { PERSON_ENRICHMENT_THROTTLE_MAX_REQUESTS } from 'src/engine/core-modules/company-enrichment/constants/person-enrichment-throttle-max-requests.constant';
import { PERSON_ENRICHMENT_THROTTLE_WINDOW_MS } from 'src/engine/core-modules/company-enrichment/constants/person-enrichment-throttle-window-ms.constant';
import { EnrichmentThrottleService } from 'src/engine/core-modules/company-enrichment/services/enrichment-throttle.service';
import { PeopleDataLabsClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-client.service';
import { type PeopleDataLabsEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-enrich-result.type';
import { type PeopleDataLabsPersonData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-data.type';
import {
  PERSON_ENRICHMENT_ATTEMPT_KEY,
  type PersonEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/person-enrichment-attempt-key-value.type';
import { readIsPersonEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-person-enrichment-enabled.util';
import { toWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-person-enrichment.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class PersonEnrichmentService {
  private readonly logger = new Logger(PersonEnrichmentService.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly peopleDataLabsClientService: PeopleDataLabsClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly enrichmentThrottleService: EnrichmentThrottleService,
    private readonly keyValuePairService: KeyValuePairService<PersonEnrichmentAttemptKeyValueTypeMap>,
  ) {}

  async enrichPersonForWorkspaceCreator({
    userId,
    email,
    workspaceId,
  }: {
    userId: string;
    email: string;
    workspaceId: string;
  }): Promise<WorkspaceEnrichmentResult<WorkspacePersonEnrichment>> {
    try {
      return await this.enrichPersonForWorkspaceCreatorOrThrow({
        userId,
        email,
        workspaceId,
      });
    } catch (error) {
      this.logger.warn(
        `Person enrichment unexpectedly failed for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return { outcome: 'transientError', enrichment: null };
    }
  }

  private async enrichPersonForWorkspaceCreatorOrThrow({
    userId,
    email,
    workspaceId,
  }: {
    userId: string;
    email: string;
    workspaceId: string;
  }): Promise<WorkspaceEnrichmentResult<WorkspacePersonEnrichment>> {
    if (!readIsPersonEnrichmentEnabled(this.twentyConfigService)) {
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

    const normalizedEmail = email.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmail)) {
      return { outcome: 'unavailable', enrichment: null };
    }

    if (!this.peopleDataLabsClientService.isEnabled()) {
      return { outcome: 'unavailable', enrichment: null };
    }

    const throttleOutcome = await this.enrichmentThrottleService.consumeToken({
      throttleKey: `person-enrichment:throttler:${workspaceId}`,
      maxRequests: PERSON_ENRICHMENT_THROTTLE_MAX_REQUESTS,
      windowMs: PERSON_ENRICHMENT_THROTTLE_WINDOW_MS,
    });

    if (throttleOutcome === 'limitReached') {
      return { outcome: 'transientError', enrichment: null };
    }

    const result =
      await this.peopleDataLabsClientService.enrichPersonByEmail(
        normalizedEmail,
      );

    const enrichmentResult = this.resolveEnrichmentResult({
      result,
      workspaceId,
      email: normalizedEmail,
    });

    if (result.outcome !== 'skipped') {
      await this.recordEnrichmentAttempt({
        workspaceId,
        email: normalizedEmail,
        result,
      });
    }

    return enrichmentResult;
  }

  private resolveEnrichmentResult({
    result,
    workspaceId,
    email,
  }: {
    result: PeopleDataLabsEnrichResult<PeopleDataLabsPersonData>;
    workspaceId: string;
    email: string;
  }): WorkspaceEnrichmentResult<WorkspacePersonEnrichment> {
    if (result.outcome === 'transientError') {
      this.logger.warn(
        `Person enrichment transiently failed for workspace ${workspaceId}: ${result.message}`,
      );

      return { outcome: 'transientError', enrichment: null };
    }

    if (result.outcome !== 'matched') {
      if (result.outcome === 'permanentError') {
        this.logger.warn(
          `Person enrichment permanently failed for workspace ${workspaceId}: ${result.message} (HTTP ${result.httpStatus})`,
        );
      }

      return { outcome: 'unavailable', enrichment: null };
    }

    const enrichment = toWorkspacePersonEnrichment({
      email,
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
    email,
    result,
  }: {
    workspaceId: string;
    email: string;
    result: Exclude<
      PeopleDataLabsEnrichResult<PeopleDataLabsPersonData>,
      { outcome: 'skipped' }
    >;
  }): Promise<void> {
    try {
      await this.keyValuePairService.set({
        userId: null,
        workspaceId,
        key: PERSON_ENRICHMENT_ATTEMPT_KEY,
        value: {
          email,
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
        `Failed to record person enrichment attempt for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
