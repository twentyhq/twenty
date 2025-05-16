import { isDefined } from 'class-validator';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  CreatedByFromAuthContextService,
  RecordToCreateData,
} from 'src/engine/core-modules/actor/services/created-by-from-auth-context.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`*.createOne`)
export class CreatedByCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly createdByFromAuthContextService: CreatedByFromAuthContextService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs<RecordToCreateData>,
  ): Promise<CreateOneResolverArgs<RecordToCreateData>> {
    if (!isDefined(payload.data)) {
      throw new GraphqlQueryRunnerException(
        'Payload data is required',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    await this.createdByFromAuthContextService.injectCreatedBy(
      payload.data,
      objectName,
      authContext,
    );

    return payload;
  }
}
