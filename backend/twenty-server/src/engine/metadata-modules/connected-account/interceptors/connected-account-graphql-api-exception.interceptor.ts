import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { connectedAccountGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/connected-account/utils/connected-account-graphql-api-exception-handler.util';

@Injectable()
export class ConnectedAccountGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(connectedAccountGraphqlApiExceptionHandler));
  }
}
