import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

import { type Request } from 'express';
import { type Observable, tap } from 'rxjs';
import { isDefined } from 'twenty-shared/utils';

import { RESOLVER_SCHEMA_SCOPE_KEY } from 'src/engine/api/graphql/graphql-config/constants/resolver-schema-scope-key.constant';
import { type ResolverSchemaScope } from 'src/engine/api/graphql/graphql-config/types/resolver-schema-scope.type';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { SERVER_ADMIN_ACTION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/server-admin/server-admin-action';
import { AUDITED_SERVER_ADMIN_QUERIES } from 'src/engine/core-modules/server-admin-access/constants/audited-server-admin-queries.constant';
import { extractTargetIdsFromResolverArgs } from 'src/engine/core-modules/server-admin-access/utils/extract-target-ids-from-resolver-args.util';

// Registered app-wide so every resolver of the admin schema is audited without opting in.
@Injectable()
export class ServerAdminAuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (
      context.getType<GqlContextType>() !== 'graphql' ||
      Reflect.getMetadata(RESOLVER_SCHEMA_SCOPE_KEY, context.getClass()) !==
        ('admin' satisfies ResolverSchemaScope)
    ) {
      return next.handle();
    }

    const graphqlContext = GqlExecutionContext.create(context);
    const info = graphqlContext.getInfo();
    const operationType = info.operation.operation;

    if (
      operationType === 'subscription' ||
      (operationType === 'query' &&
        !AUDITED_SERVER_ADMIN_QUERIES.has(info.fieldName))
    ) {
      return next.handle();
    }

    const request: Request = graphqlContext.getContext().req;

    // Unauthenticated admin operations (console sign-in) record their own event once the user is known.
    if (!isDefined(request.user)) {
      return next.handle();
    }

    const targetIds = extractTargetIdsFromResolverArgs(
      graphqlContext.getArgs(),
    );

    const recordAction = (outcome: 'success' | 'failure') => {
      void this.eventLogEmitterService
        .createContext({
          workspaceId: request.workspace?.id,
          userId: request.user?.id,
        })
        .insertWorkspaceEvent(SERVER_ADMIN_ACTION_EVENT, {
          operation: info.fieldName,
          operationType,
          outcome,
          targetIds,
        });
    };

    return next.handle().pipe(
      tap({
        next: () => recordAction('success'),
        error: () => recordAction('failure'),
      }),
    );
  }
}
