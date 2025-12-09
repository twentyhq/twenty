import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateInput = Record<string, any>;

@Injectable()
export class CreatedByFromAuthContextService {
  private readonly logger = new Logger(CreatedByFromAuthContextService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async injectCreatedBy(
    records: CreateInput[],
    objectMetadataNameSingular: string,
    authContext: AuthContext,
  ): Promise<CreateInput[]> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    this.logger.log(
      `Injecting createdBy from auth context for object ${objectMetadataNameSingular} and workspace ${workspace.id}`,
    );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const objectId = idByNameSingular[objectMetadataNameSingular];
    const objectMetadata = objectId
      ? flatObjectMetadataMaps.byId[objectId]
      : undefined;

    const fieldIdByName = objectMetadata
      ? buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          objectMetadata,
        ).fieldIdByName
      : {};

    this.logger.log(
      `Object metadata found with fields: ${Object.keys(fieldIdByName)}`,
    );

    if (!isDefined(fieldIdByName['createdBy'])) {
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
    const { workspace, user, apiKey, application } = authContext;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    if (isDefined(user)) {
      return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext as WorkspaceAuthContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const workspaceMember = await workspaceMemberRepository.findOneOrFail(
            {
              where: {
                userId: user.id,
              },
            },
          );

          return buildCreatedByFromFullNameMetadata({
            fullNameMetadata: workspaceMember.name,
            workspaceMemberId: workspaceMember.id,
          });
        },
      );
    }

    if (isDefined(apiKey)) {
      return buildCreatedByFromApiKey({
        apiKey,
      });
    }

    if (isDefined(application)) {
      return buildCreatedByFromApplication({
        application,
      });
    }

    throw new Error(
      'Unable to build createdBy metadata - no valid actor information found in auth context',
    );
  }
}
