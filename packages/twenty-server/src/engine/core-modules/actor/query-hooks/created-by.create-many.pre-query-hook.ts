import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  ActorFromAuthContextService,
  type RecordInput,
} from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`*.createMany`)
export class CreatedByCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateManyResolverArgs<RecordInput>,
  ): Promise<CreateManyResolverArgs<RecordInput>> {
    if (!isDefined(payload.data)) {
      throw new GraphqlQueryRunnerException(
        'Payload data is required',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return {
      ...payload,
      data: await this.actorFromAuthContextService.injectActorFieldsOnCreate({
        records: payload.data,
        objectMetadataNameSingular: objectName,
        authContext,
      }),
    };
  }
}
