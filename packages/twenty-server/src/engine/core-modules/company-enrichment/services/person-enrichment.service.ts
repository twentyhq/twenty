import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspacePersonEnrichmentResult } from 'twenty-shared/workspace';

import { PERSON_ENRICHMENT_THROTTLE_MAX_REQUESTS } from 'src/engine/core-modules/company-enrichment/constants/person-enrichment-throttle-max-requests.constant';
import { PERSON_ENRICHMENT_THROTTLE_WINDOW_MS } from 'src/engine/core-modules/company-enrichment/constants/person-enrichment-throttle-window-ms.constant';
import { PeopleDataLabsPersonClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-person-client.service';
import { type PeopleDataLabsPersonEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-enrich-result.type';
import {
  PERSON_ENRICHMENT_ATTEMPT_KEY,
  type PersonEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/person-enrichment-attempt-key-value.type';
import { readIsPersonEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-person-enrichment-enabled.util';
import { toWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-person-enrichment.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class PersonEnrichmentService {
  private readonly logger = new Logger(PersonEnrichmentService.name);

  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly peopleDataLabsPersonClientService: PeopleDataLabsPersonClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly throttlerService: ThrottlerService,
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
  }): Promise<WorkspacePersonEnrichmentResult> {
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

    // Checked before throttling so a disabled feature never burns a throttle token.
    if (!this.peopleDataLabsPersonClientService.isEnabled()) {
      return { outcome: 'unavailable', enrichment: null };
    }

    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `person-enrichment:throttler:${workspaceId}`,
        1,
        PERSON_ENRICHMENT_THROTTLE_MAX_REQUESTS,
        PERSON_ENRICHMENT_THROTTLE_WINDOW_MS,
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
      await this.peopleDataLabsPersonClientService.enrichPersonByEmail(
        normalizedEmail,
      );

    const enrichmentResult = this.resolveEnrichmentResult({
      result,
      workspaceId,
      email: normalizedEmail,
    });

    // 'skipped' means the feature is disabled (no API key); don't persist the email in that case.
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
    result: PeopleDataLabsPersonEnrichResult;
    workspaceId: string;
    email: string;
  }): WorkspacePersonEnrichmentResult {
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
    result: Exclude<PeopleDataLabsPersonEnrichResult, { outcome: 'skipped' }>;
  }): Promise<void> {
    // Best-effort telemetry: never let a key-value write failure fail the enrichment.
    // The pre-collapse outcome is recorded so an operator can tell "no PDL match for this
    // email" apart from "the PDL integration is broken" (both surface as 'unavailable').
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
