import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
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

    if (!isDefined(fieldIdByName[fieldName])) {
      return records;
    }

    const clonedRecords = structuredClone(records);

    const actorMetadata = buildActorMetadataFromAuthContext(authContext);

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
}
