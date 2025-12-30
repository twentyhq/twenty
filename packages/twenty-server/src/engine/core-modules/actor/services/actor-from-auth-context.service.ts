import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type RecordInput = Record<string, unknown>;

export type InjectActorParams = {
  records: RecordInput[];
  objectMetadataNameSingular: string;
  authContext: AuthContext;
};

@Injectable()
export class ActorFromAuthContextService {
  private readonly logger = new Logger(ActorFromAuthContextService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async injectCreatedBy({
    records,
    objectMetadataNameSingular,
    authContext,
  }: InjectActorParams): Promise<RecordInput[]> {
    return this.injectActorField({
      records,
      objectMetadataNameSingular,
      authContext,
      fieldName: 'createdBy',
    });
  }

  async injectActorFieldsOnCreate({
    records,
    objectMetadataNameSingular,
    authContext,
  }: InjectActorParams): Promise<RecordInput[]> {
    const recordsWithCreatedBy = await this.injectActorField({
      records,
      objectMetadataNameSingular,
      authContext,
      fieldName: 'createdBy',
    });

    return await this.injectActorField({
      records: recordsWithCreatedBy,
      objectMetadataNameSingular,
      authContext,
      fieldName: 'updatedBy',
    });
  }

  async injectUpdatedBy({
    records,
    objectMetadataNameSingular,
    authContext,
  }: InjectActorParams): Promise<RecordInput[]> {
    return this.injectActorField({
      records,
      objectMetadataNameSingular,
      authContext,
      fieldName: 'updatedBy',
    });
  }

  private async injectActorField({
    records,
    objectMetadataNameSingular,
    authContext,
    fieldName,
  }: InjectActorParams & { fieldName: 'createdBy' | 'updatedBy' }): Promise<
    RecordInput[]
  > {
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
      `Injecting ${fieldName} from auth context for object ${objectMetadataNameSingular} and workspace ${workspace.id}`,
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

    if (!isDefined(fieldIdByName[fieldName])) {
      this.logger.log(
        `${fieldName} field not found in object metadata, skipping injection`,
      );

      return records;
    }

    const clonedRecords = structuredClone(records);

    const actorMetadata = await this.buildActorMetadata(authContext);

    for (const record of clonedRecords) {
      this.injectActorToRecord(actorMetadata, record, fieldName);
    }

    return clonedRecords;
  }

  private injectActorToRecord(
    actorMetadata: ActorMetadata,
    record: RecordInput,
    fieldName: 'createdBy' | 'updatedBy',
  ) {
    const existingValue = record[fieldName] as ActorMetadata | undefined;

    if (fieldName === 'createdBy') {
      if (actorMetadata && (!existingValue || !existingValue.name)) {
        record[fieldName] = {
          ...actorMetadata,
          source: existingValue?.source ?? actorMetadata.source,
        };
      }
    } else {
      record[fieldName] = actorMetadata;
    }
  }

  private async buildActorMetadata(
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
      'Unable to build actor metadata - no valid actor information found in auth context',
    );
  }
}
