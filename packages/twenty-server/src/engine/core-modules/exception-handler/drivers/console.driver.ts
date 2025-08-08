/* eslint-disable no-console */
import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';

export class ExceptionHandlerConsoleDriver
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
