import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { type CustomException } from 'src/utils/custom-exception';
import {
  type WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Catch()
export class WorkflowTriggerRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: WorkflowTriggerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case WorkflowTriggerExceptionCode.INVALID_INPUT:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION:
      case WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          400,
        );
      case WorkflowTriggerExceptionCode.FORBIDDEN:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          403,
        );
      case WorkflowTriggerExceptionCode.NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case WorkflowTriggerExceptionCode.INTERNAL_ERROR:
      default:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
    }
  }
}
