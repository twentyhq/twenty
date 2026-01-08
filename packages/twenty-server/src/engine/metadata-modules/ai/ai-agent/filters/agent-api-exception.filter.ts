import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';

@Catch(AgentException)
export class AgentRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: AgentException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case AgentExceptionCode.AGENT_NOT_FOUND:
      case AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      case AgentExceptionCode.ROLE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case AgentExceptionCode.API_KEY_NOT_CONFIGURED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          503, // Service Unavailable - the AI service is not configured
        );
      case AgentExceptionCode.AGENT_EXECUTION_FAILED:
      case AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
      case AgentExceptionCode.INVALID_AGENT_INPUT:
      case AgentExceptionCode.AGENT_ALREADY_EXISTS:
      case AgentExceptionCode.AGENT_IS_STANDARD:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
