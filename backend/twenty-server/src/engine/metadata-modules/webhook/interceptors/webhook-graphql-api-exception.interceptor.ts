import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { webhookGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/webhook/utils/webhook-graphql-api-exception-handler.util';

@Injectable()
export class WebhookGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(catchError(webhookGraphqlApiExceptionHandler));
  }
}
