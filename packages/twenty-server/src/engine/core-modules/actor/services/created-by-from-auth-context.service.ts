import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateInput = Record<string, any>;

@Injectable()
export class CreatedByFromAuthContextService {
  private readonly logger = new Logger(CreatedByFromAuthContextService.name);

  constructor(
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async injectCreatedBy(
    records: CreateInput[],
    objectMetadataNameSingular: string,
    authContext: AuthContext,
  ): Promise<CreateInput[]> {
    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    // TODO: Once all objects have it, we can remove this check
    const createdByFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        object: {
          nameSingular: objectMetadataNameSingular,
        },
        name: 'createdBy',
        workspaceId: workspace.id,
      },
    });

    if (!createdByFieldMetadata) {
      return records;
    }

    const clonedRecords = structuredClone(records);

    const createdBy = await this.buildCreatedBy(authContext);

    if (Array.isArray(clonedRecords)) {
      for (const datum of clonedRecords) {
        this.injectCreatedByToRecord(createdBy, datum);
      }
    } else {
      this.injectCreatedByToRecord(createdBy, clonedRecords);
    }

    return clonedRecords;
  }

  private injectCreatedByToRecord(
    createdBy: ActorMetadata,
    record: CreateInput,
  ) {
    // Front-end can fill the source field
    if (createdBy && (!record.createdBy || !record.createdBy?.name)) {
      record.createdBy = {
        ...createdBy,
        source: record.createdBy?.source ?? createdBy.source,
      };
    }
  }

  private async buildCreatedBy(
    authContext: AuthContext,
  ): Promise<ActorMetadata> {
    const { workspace, workspaceMemberId, user, apiKey } = authContext;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    // TODO: remove that code once we have the workspace member id in all tokens
    if (isDefined(workspaceMemberId) && isDefined(user)) {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspaceMemberId,
      });
    }

    if (isDefined(user)) {
      this.logger.warn("User doesn't have a workspace member id in the token");

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspace.id,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOneOrFail({
        where: {
          userId: user.id,
        },
      });

      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: workspaceMember.name,
        workspaceMemberId: workspaceMember.id,
      });
    }

    if (isDefined(apiKey)) {
      return buildCreatedByFromApiKey({
        apiKey,
      });
    }

    throw new Error(
      'Unable to build createdBy metadata - no valid actor information found in auth context',
    );
  }
}
