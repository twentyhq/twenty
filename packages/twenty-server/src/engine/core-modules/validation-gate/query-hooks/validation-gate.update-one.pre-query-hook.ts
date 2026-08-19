import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ValidationGateService } from 'src/engine/core-modules/validation-gate/services/validation-gate.service';

/**
 * Runs before every single-record update, on every object.
 *
 * Registered against `*.updateOne`, which covers GraphQL, the REST API and MCP -
 * they all funnel through the same common query runner. Writes originating from
 * workflows carry a `system` auth context and are exempted inside the service.
 */
@WorkspaceQueryHook(`*.updateOne`)
export class ValidationGateUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(private readonly validationGateService: ValidationGateService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    if (!isDefined(payload.data) || !isDefined(payload.id)) {
      return payload;
    }

    await this.validationGateService.assertUpdateAllowed({
      authContext,
      objectName,
      recordId: payload.id,
      data: payload.data as Record<string, unknown>,
    });

    // The gate never mutates the payload - it either allows it through unchanged
    // or throws.
    return payload;
  }
}
