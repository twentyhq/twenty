import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';
import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';

export interface ExceptionHandlerDriverInterface {
  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[];
  captureMessage(message: string, user?: ExceptionHandlerUser): void;
}
