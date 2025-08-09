import { Inject, Injectable } from '@nestjs/common';

import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { EXCEPTION_HANDLER_DRIVER } from 'src/engine/core-modules/exception-handler/exception-handler.constants';

@Injectable()
export class ExceptionHandlerService {
  constructor(
    @Inject(EXCEPTION_HANDLER_DRIVER)
    private driver: ExceptionHandlerDriverInterface,
  ) {}

  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[] {
    return this.driver.captureExceptions(exceptions, options);
  }
}
