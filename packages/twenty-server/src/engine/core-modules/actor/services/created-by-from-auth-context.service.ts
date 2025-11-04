import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateInput = Record<string, any>;

@Injectable()
export class CreatedByFromAuthContextService {
  private readonly logger = new Logger(CreatedByFromAuthContextService.name);

  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  async injectCreatedBy(
    records: CreateInput[],
    objectMetadataNameSingular: string,
    authContext: AuthContext,
  ): Promise<CreateInput[]> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        {
          workspaceId: workspace.id,
        },
      );

    this.logger.log(
      `Injecting createdBy from auth context for object ${objectMetadataNameSingular} and workspace ${workspace.id}`,
    );

    const objectMetadata = getObjectMetadataMapItemByNameSingular(
      objectMetadataMaps,
      objectMetadataNameSingular,
    );

    this.logger.log(
      `Object metadata found with fields: ${Object.keys(objectMetadata?.fieldIdByName ?? {})}`,
    );

    if (!isDefined(objectMetadata?.fieldIdByName['createdBy'])) {
      this.logger.log(
        `CreatedBy field not found in object metadata, skipping injection`,
      );

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

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

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
          { shouldBypassPermissionChecks: true },
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
