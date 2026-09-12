import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { connectionProviderGraphqlApiExceptionHandler } from 'src/engine/core-modules/application/connection-provider/utils/connection-provider-graphql-api-exception-handler.util';

@Injectable()
export class ConnectionProviderGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(connectionProviderGraphqlApiExceptionHandler));
  }
}
