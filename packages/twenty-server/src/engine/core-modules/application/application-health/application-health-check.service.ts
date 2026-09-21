import { Injectable, Logger } from '@nestjs/common';

import { isApplicationHealthCheckResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

type PersistedHealth = {
  healthStatus: ApplicationHealthStatus;
  healthMessage: string | null;
  healthActionLabel: string | null;
};

const REPORTED_STATUS_TO_HEALTH_STATUS = {
  ok: ApplicationHealthStatus.OK,
  warning: ApplicationHealthStatus.WARNING,
  error: ApplicationHealthStatus.ERROR,
} as const;

const UNKNOWN_HEALTH: PersistedHealth = {
  healthStatus: ApplicationHealthStatus.UNKNOWN,
  healthMessage: null,
  healthActionLabel: null,
};

@Injectable()
export class ApplicationHealthCheckService {
  private readonly logger = new Logger(ApplicationHealthCheckService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async run({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<ApplicationHealthStatus | null> {
    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: applicationId,
        workspaceId,
      });

    const { healthCheckLogicFunctionId, version } = application;

    if (!isDefined(healthCheckLogicFunctionId)) {
      return null;
    }

    const health = await this.executeHealthCheck({
      healthCheckLogicFunctionId,
      workspaceId,
      version,
    });

    await this.applicationService.update(applicationId, {
      workspaceId,
      ...health,
      healthCheckedAt: new Date(),
    });

    return health.healthStatus;
  }

  private async executeHealthCheck({
    healthCheckLogicFunctionId,
    workspaceId,
    version,
  }: {
    healthCheckLogicFunctionId: string;
    workspaceId: string;
    version: string | null;
  }): Promise<PersistedHealth> {
    const executionResult = await this.logicFunctionExecutorService
      .execute({
        logicFunctionId: healthCheckLogicFunctionId,
        workspaceId,
        payload: isDefined(version) ? { version } : {},
      })
      .catch((error) => {
        this.logger.warn(
          `Health check ${healthCheckLogicFunctionId} threw: ${error instanceof Error ? error.message : String(error)}`,
        );

        return null;
      });

    // A health check that fails, times out or reports a shape we cannot read
    // tells us nothing about the app. Reporting that as an error would paint
    // every app red whenever a third party has an outage.
    if (!isDefined(executionResult) || isDefined(executionResult.error)) {
      return UNKNOWN_HEALTH;
    }

    const { data } = executionResult;

    if (!isApplicationHealthCheckResult(data)) {
      this.logger.warn(
        `Health check ${healthCheckLogicFunctionId} returned an unreadable result`,
      );

      return UNKNOWN_HEALTH;
    }

    if (data.status === 'ok') {
      return {
        healthStatus: ApplicationHealthStatus.OK,
        healthMessage: null,
        healthActionLabel: null,
      };
    }

    return {
      healthStatus: REPORTED_STATUS_TO_HEALTH_STATUS[data.status],
      healthMessage: data.message,
      healthActionLabel: data.action?.label ?? null,
    };
  }
}
