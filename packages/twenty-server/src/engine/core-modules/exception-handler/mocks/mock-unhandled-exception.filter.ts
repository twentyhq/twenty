import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class MockedUnhandledExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  // oxlint-disable-next-line typescript/no-explicit-any
  catch(exception: any, _host: ArgumentsHost) {
    throw exception;
  }
}
