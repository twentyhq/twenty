import { Injectable } from '@nestjs/common';

import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';

@Injectable()
export class ExceptionHandlerMockService
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptions: readonly any[],
    _?: ExceptionHandlerOptions | undefined,
  ): string[] {
    return exceptions.map(() => 'mocked-exception-id');
  }
}
