import { Injectable } from '@nestjs/common';

import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

@Injectable()
export class ExceptionHandlerMockService {
  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[] {
    return exceptions.map(() => 'mocked-exception-id');
  }
}
