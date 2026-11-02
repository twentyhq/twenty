import { Injectable } from '@nestjs/common';

import {
  ApplicationHealthStatus,
  isApplicationHealthCheckResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  USER_HEALTH_CHECK_RATE_LIMIT_MAX,
  USER_HEALTH_CHECK_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/application-health/constants/user-health-check-rate-limit.constant';
import { buildUserHealthCheckRateLimitKey } from 'src/engine/core-modules/application/application-health/utils/build-user-health-check-rate-limit-key.util';
import { getHealthCheckLogicFunctionIdForUser } from 'src/engine/core-modules/application/application-health/utils/get-health-check-logic-function-id-for-user.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const UNKNOWN_HEALTH: ApplicationHealthCheckResultDTO = {
  status: ApplicationHealthStatus.UNKNOWN,
  title: null,
  description: null,
  action: null,
};

@Injectable()
export class ApplicationHealthCheckService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  async run({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<ApplicationHealthCheckResultDTO | null> {
    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: applicationId,
        workspaceId,
      });

    const { healthCheckLogicFunctionId, isUserHealthCheckEnabled } =
      application;

    if (
      !isDefined(isUserHealthCheckEnabled) ||
      isUserHealthCheckEnabled ||
      !isDefined(healthCheckLogicFunctionId)
    ) {
      return null;
    }

    return await this.executeHealthCheck({
      healthCheckLogicFunctionId,
      workspaceId,
    });
  }

  async runForUser({
    applicationId,
    workspaceId,
    userId,
    userWorkspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
  }): Promise<ApplicationHealthCheckResultDTO | null> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        id: applicationId,
        workspaceId,
      },
    );
    const healthCheckLogicFunctionId =
      getHealthCheckLogicFunctionIdForUser(application);

    if (!isDefined(healthCheckLogicFunctionId)) {
      return null;
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      buildUserHealthCheckRateLimitKey({
        workspaceId,
        userWorkspaceId,
        applicationId: application.id,
      }),
      1,
      USER_HEALTH_CHECK_RATE_LIMIT_MAX,
      USER_HEALTH_CHECK_RATE_LIMIT_WINDOW_MS,
    );

    return await this.executeHealthCheck({
      healthCheckLogicFunctionId,
      workspaceId,
      userId,
      userWorkspaceId,
    });
  }

  private async executeHealthCheck({
    healthCheckLogicFunctionId,
    workspaceId,
    userId,
    userWorkspaceId,
  }: {
    healthCheckLogicFunctionId: string;
    workspaceId: string;
    userId?: string;
    userWorkspaceId?: string;
  }): Promise<ApplicationHealthCheckResultDTO> {
    const executionResult = await this.logicFunctionExecutorService
      .execute({
        logicFunctionId: healthCheckLogicFunctionId,
        workspaceId,
        payload: isDefined(userWorkspaceId) ? { userWorkspaceId } : {},
        userId,
        userWorkspaceId,
      })
      .catch(() => null);

    if (!isDefined(executionResult) || isDefined(executionResult.error)) {
      return UNKNOWN_HEALTH;
    }

    const { data } = executionResult;

    if (!isApplicationHealthCheckResult(data)) {
      return UNKNOWN_HEALTH;
    }

    if (data.status === ApplicationHealthStatus.OK) {
      return {
        status: ApplicationHealthStatus.OK,
        title: null,
        description: null,
        action: null,
      };
    }

    const { action } = data;

    return {
      status: ApplicationHealthStatus[data.status],
      title: data.title,
      description: data.description ?? null,
      action: isDefined(action)
        ? { label: action.label, location: action.location ?? null }
        : null,
    };
  }
}
