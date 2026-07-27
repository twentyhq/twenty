import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { type CustomException } from 'src/utils/custom-exception';

const applicationExceptionCodeToHttpStatus = (
  code: ApplicationExceptionCode,
): number => {
  switch (code) {
    case ApplicationExceptionCode.OBJECT_NOT_FOUND:
    case ApplicationExceptionCode.FIELD_NOT_FOUND:
    case ApplicationExceptionCode.ENTITY_NOT_FOUND:
    case ApplicationExceptionCode.APPLICATION_NOT_FOUND:
    case ApplicationExceptionCode.APP_NOT_INSTALLED:
    case ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
    case ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND:
      return 404;
    case ApplicationExceptionCode.FORBIDDEN:
      return 403;
    case ApplicationExceptionCode.INVALID_INPUT:
    case ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH:
    case ApplicationExceptionCode.APP_ALREADY_INSTALLED:
    case ApplicationExceptionCode.CANNOT_DOWNGRADE_APPLICATION:
    case ApplicationExceptionCode.SERVER_VERSION_INCOMPATIBLE:
    case ApplicationExceptionCode.WORKSPACE_VERSION_INCOMPATIBLE:
    case ApplicationExceptionCode.INVALID_APP_ENGINE_REQUIREMENT:
    case ApplicationExceptionCode.INVALID_WORKSPACE_VERSION:
      return 400;
    case ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED:
    case ApplicationExceptionCode.POST_INSTALL_ERROR:
    case ApplicationExceptionCode.PRE_INSTALL_ERROR:
    case ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED:
    case ApplicationExceptionCode.UPGRADE_FAILED:
    case ApplicationExceptionCode.INVALID_SERVER_VERSION:
    case ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED:
    case ApplicationExceptionCode.KEY_VALUE_PERSISTENCE_FAILED:
      return 500;
    default:
      return assertUnreachable(code);
  }
};

@Injectable()
@Catch(ApplicationException)
export class ApplicationRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ApplicationException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception as CustomException,
      response,
      applicationExceptionCodeToHttpStatus(exception.code),
    );
  }
}
