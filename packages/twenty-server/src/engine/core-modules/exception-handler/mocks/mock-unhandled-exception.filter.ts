import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Exception } from 'bullmq';

@Catch()
export class MockedUnhandledExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Exception, _host: ArgumentsHost) {
    throw exception;
  }
}
