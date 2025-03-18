import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CrudByFromAuthContextService } from 'src/engine/core-modules/actor/services/crud-by-from-auth-context.service';

type CustomWorkspaceItem = Omit<
  CustomWorkspaceEntity,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

@WorkspaceQueryHook(`*.updateMany`)
export class UpdatedByUpdateManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly crudByFromAuthContextService: CrudByFromAuthContextService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: UpdateManyResolverArgs<CustomWorkspaceItem>,
  ): Promise<UpdateManyResolverArgs<CustomWorkspaceItem>> {
    if (!isDefined(payload.data)) {
      throw new GraphqlQueryRunnerException(
        'Payload data is required',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    // TODO: Once all objects have it, we can remove this check
    const updatedByFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        object: {
          nameSingular: objectName,
        },
        name: 'updatedBy',
        workspaceId: authContext.workspace.id,
      },
    });

    if (!updatedByFieldMetadata) {
      return payload;
    }

    const updatedBy =
      await this.crudByFromAuthContextService.buildCrudBy(authContext);

    if (
      updatedBy &&
      (!payload.data.updatedBy || !payload.data.updatedBy?.name)
    ) {
      payload.data.updatedBy = {
        ...updatedBy,
        source: payload.data.updatedBy?.source ?? updatedBy.source,
      };
    }

    return payload;
  }
}
