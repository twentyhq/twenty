import { Inject, Injectable } from '@nestjs/common';

import { ExceptionHandlerOptions } from 'src/engine/integrations/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/integrations/exception-handler/interfaces';
import { EXCEPTION_HANDLER_DRIVER } from 'src/engine/integrations/exception-handler/exception-handler.constants';

@Injectable()
export class ExceptionHandlerService {
  constructor(
    @Inject(EXCEPTION_HANDLER_DRIVER)
    private driver: ExceptionHandlerDriverInterface,
  ) {}

  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[] {
    return this.driver.captureExceptions(exceptions, options);
  }
}
