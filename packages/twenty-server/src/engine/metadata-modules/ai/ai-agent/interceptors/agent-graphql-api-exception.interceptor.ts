import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { agentGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/ai-agent/utils/agent-graphql-api-exception-handler.util';

@Injectable()
export class AgentGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(catchError(agentGraphqlApiExceptionHandler));
  }
}
