import { Injectable } from '@nestjs/common';

import {
  ApplicationHealthStatus,
  isApplicationHealthCheckResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

const UNKNOWN_HEALTH: ApplicationHealthCheckResultDTO = {
  status: ApplicationHealthStatus.UNKNOWN,
  message: null,
  action: null,
};

@Injectable()
export class ApplicationHealthCheckService {
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

    const { healthCheckLogicFunctionId } = application;

    if (!isDefined(healthCheckLogicFunctionId)) {
      return null;
    }

    return await this.executeHealthCheck({
      healthCheckLogicFunctionId,
      workspaceId,
    });
  }

  private async executeHealthCheck({
    healthCheckLogicFunctionId,
    workspaceId,
  }: {
    healthCheckLogicFunctionId: string;
    workspaceId: string;
  }): Promise<ApplicationHealthCheckResultDTO> {
    const executionResult = await this.logicFunctionExecutorService
      .execute({
        logicFunctionId: healthCheckLogicFunctionId,
        workspaceId,
        payload: {},
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
        message: null,
        action: null,
      };
    }

    const { action } = data;

    return {
      status: ApplicationHealthStatus[data.status],
      message: data.message,
      action: isDefined(action)
        ? { label: action.label, location: action.location ?? null }
        : null,
    };
  }
}
