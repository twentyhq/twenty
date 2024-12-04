/* eslint-disable no-console */
import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';

export class ExceptionHandlerConsoleDriver
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ) {
    console.group('Exception Captured');
    console.info(options);
    console.error(exceptions);
    console.groupEnd();

    return [];
  }
}
