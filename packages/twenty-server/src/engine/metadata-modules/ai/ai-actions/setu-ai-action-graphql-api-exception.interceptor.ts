import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { catchError, type Observable } from 'rxjs';

import { setuAiActionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/ai-actions/utils/setu-ai-action-graphql-api-exception-handler.util';

@Injectable()
export class SetuAiActionGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(setuAiActionGraphqlApiExceptionHandler));
  }
}
