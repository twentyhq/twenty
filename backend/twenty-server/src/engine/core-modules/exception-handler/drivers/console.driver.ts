/* oxlint-disable no-console */
import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';

export class ExceptionHandlerConsoleDriver
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ) {
    const sanitizedOptions = options
      ? {
          ...options,
          user: options.user
            ? {
                id: options.user.id,
                email: options.user.email,
                firstName: options.user.firstName,
                lastName: options.user.lastName,
              }
            : undefined,
        }
      : undefined;

    console.group('Exception Captured');
    console.info(sanitizedOptions);
    console.error(exceptions);
    console.groupEnd();

    return [];
  }
}
