import { Injectable, Logger } from '@nestjs/common';

import { isApplicationHealthCheckResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

const REPORTED_STATUS_TO_HEALTH_STATUS = {
  ok: ApplicationHealthStatus.OK,
  warning: ApplicationHealthStatus.WARNING,
  error: ApplicationHealthStatus.ERROR,
} as const;

const UNKNOWN_HEALTH: ApplicationHealthCheckResultDTO = {
  status: ApplicationHealthStatus.UNKNOWN,
  message: null,
  actionLabel: null,
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
  }): Promise<ApplicationHealthCheckResultDTO | null> {
    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: applicationId,
        workspaceId,
      });

    const { healthCheckLogicFunctionId, version } = application;

    if (!isDefined(healthCheckLogicFunctionId)) {
      return null;
    }

    return await this.executeHealthCheck({
      healthCheckLogicFunctionId,
      workspaceId,
      version,
    });
  }

  private async executeHealthCheck({
    healthCheckLogicFunctionId,
    workspaceId,
    version,
  }: {
    healthCheckLogicFunctionId: string;
    workspaceId: string;
    version: string | null;
  }): Promise<ApplicationHealthCheckResultDTO> {
    const executionResult = await this.logicFunctionExecutorService
      .execute({
        logicFunctionId: healthCheckLogicFunctionId,
        workspaceId,
        payload: isDefined(version) ? { version } : {},
      })
      .catch((error) => {
        this.logger.warn(
          `Health check ${healthCheckLogicFunctionId} for workspace ${workspaceId} threw: ${error instanceof Error ? error.message : String(error)}`,
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
        `Health check ${healthCheckLogicFunctionId} for workspace ${workspaceId} returned an unreadable result`,
      );

      return UNKNOWN_HEALTH;
    }

    if (data.status === 'ok') {
      return {
        status: ApplicationHealthStatus.OK,
        message: null,
        actionLabel: null,
      };
    }

    return {
      status: REPORTED_STATUS_TO_HEALTH_STATUS[data.status],
      message: data.message,
      actionLabel: data.action?.label ?? null,
    };
  }
}
