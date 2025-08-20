import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

export interface ExceptionHandlerDriverInterface {
  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[];
}
