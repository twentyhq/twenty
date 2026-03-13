import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/guards/is-pending-activation-user-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';

export type RecordInput = Record<string, unknown>;

export type InjectActorParams = {
  records: RecordInput[];
  objectMetadataNameSingular: string;
  authContext: WorkspaceAuthContext;
};

@Injectable()
export class ActorFromAuthContextService {
  private readonly logger = new Logger(ActorFromAuthContextService.name);

  constructor(
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const objectId = idByNameSingular[objectMetadataNameSingular];
    const objectMetadata = objectId
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
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

    const actorMetadata = this.buildActorMetadata(authContext);

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

  private buildActorMetadata(authContext: WorkspaceAuthContext): ActorMetadata {
    if (isUserAuthContext(authContext)) {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: authContext.workspaceMember.name,
        workspaceMemberId: authContext.workspaceMemberId,
      });
    }

    if (isApiKeyAuthContext(authContext)) {
      return buildCreatedByFromApiKey({
        apiKey: authContext.apiKey,
      });
    }

    if (isApplicationAuthContext(authContext)) {
      return buildCreatedByFromApplication({
        application: authContext.application,
      });
    }

    if (isPendingActivationUserAuthContext(authContext)) {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: authContext.user.firstName,
          lastName: authContext.user.lastName,
        },
        workspaceMemberId: '',
      });
    }

    throw new Error(
      `Unable to build actor metadata - unhandled auth context type: ${authContext.type}`,
    );
  }
}
