import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

import { RESOLVER_SCHEMA_SCOPE_KEY } from 'src/engine/api/graphql/graphql-config/constants/resolver-schema-scope-key.constant';
import { type ResolverSchemaScope } from 'src/engine/api/graphql/graphql-config/types/resolver-schema-scope.type';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { ALLOW_SUSPENDED_WORKSPACE_KEY } from 'src/engine/guards/constants/allow-suspended-workspace-key.constant';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class WorkspaceNotSuspendedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = getRequest(context);

    if (!isWorkspaceSuspended(request?.workspace)) {
      return true;
    }

    if (this.isAllowedWhenSuspended(context)) {
      return true;
    }

    if (this.isQueryOutsideCoreSchema(context)) {
      return true;
    }

    throw new AuthException(
      'Workspace is suspended',
      AuthExceptionCode.WORKSPACE_SUSPENDED,
    );
  }

  private isAllowedWhenSuspended(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(ALLOW_SUSPENDED_WORKSPACE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }

  private isQueryOutsideCoreSchema(context: ExecutionContext): boolean {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return false;
    }

    const resolverSchemaScope = this.reflector.get<ResolverSchemaScope>(
      RESOLVER_SCHEMA_SCOPE_KEY,
      context.getClass(),
    );

    if (resolverSchemaScope === 'core') {
      return false;
    }

    return (
      GqlExecutionContext.create(context).getInfo<
        { operation?: { operation?: string } } | undefined
      >()?.operation?.operation === 'query'
    );
  }
}
