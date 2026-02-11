import { Injectable } from '@nestjs/common';

import {
  FieldMetadataType,
  ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FilesFieldQueryResultGetterHandler } from 'src/engine/api/common/common-result-getters/handlers/field-handlers/files-field-query-result-getter.handler';
import { RichTextV2FieldQueryResultGetterHandler } from 'src/engine/api/common/common-result-getters/handlers/field-handlers/rich-text-v2-field-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class CommonResultGettersService {
  private objectHandlers: Map<string, QueryResultGetterHandlerInterface>;
  private fieldHandlers: Map<
    FieldMetadataType,
    QueryResultGetterHandlerInterface
  >;

  constructor(
    private readonly fileService: FileService,
    private readonly filesFieldService: FilesFieldService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    this.initializeObjectHandlers();
    this.initializeFieldHandlers();
  }

  private initializeObjectHandlers() {
    this.objectHandlers = new Map<string, QueryResultGetterHandlerInterface>([
      ['attachment', new AttachmentQueryResultGetterHandler(this.fileService)],
      ['person', new PersonQueryResultGetterHandler(this.fileService)],
      [
        'workspaceMember',
        new WorkspaceMemberQueryResultGetterHandler(this.fileService),
      ],
    ]);
  }

  private initializeFieldHandlers() {
    this.fieldHandlers = new Map<
      FieldMetadataType,
      QueryResultGetterHandlerInterface
    >([
      [
        FieldMetadataType.FILES,
        new FilesFieldQueryResultGetterHandler(this.filesFieldService),
      ],
      [
        FieldMetadataType.RICH_TEXT_V2,
        new RichTextV2FieldQueryResultGetterHandler(
          this.fileService,
          this.filesFieldService,
          this.featureFlagService,
        ),
      ],
    ]);
  }

  public async processRecordArray(
    recordArray: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
  ) {
    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    return await Promise.all(
      recordArray.map(
        async (record: ObjectRecord) =>
          await this.processRecord(
            record,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            workspaceId,
            fieldMaps,
          ),
      ),
    );
  }

  public async processRecord(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
    fieldMapsForObject?: FieldMapsForObject,
  ): Promise<ObjectRecord> {
    const fieldMaps =
      fieldMapsForObject ??
      buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    const { fieldIdByName } = fieldMaps;

    const handlers = [
      this.getObjectHandler(flatObjectMetadata.nameSingular),
      ...Object.keys(record)
        .map((recordFieldName) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldIdByName[recordFieldName],
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        )
        .filter(isDefined)
        .map((fieldMetadata) => this.fieldHandlers.get(fieldMetadata.type))
        .filter(isDefined),
    ];

    const relationFields = Object.keys(record)
      .map((recordFieldName) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[recordFieldName],
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined)
      .filter((fieldMetadata) =>
        isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION),
      );

    const relationFieldsProcessedMap = {} as Record<
      string,
      QueryResultFieldValue
    >;

    for (const relationField of relationFields) {
      if (!isDefined(relationField.relationTargetObjectMetadataId)) {
        throw new Error('Relation target object metadata id is not defined');
      }

      const recordFieldValue = record[relationField.name];

      if (!isDefined(recordFieldValue)) {
        continue;
      }

      const targetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationField.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

      relationFieldsProcessedMap[relationField.name] =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? await this.processRecordArray(
              record[relationField.name],
              targetFlatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              workspaceId,
            )
          : await this.processRecord(
              record[relationField.name],
              targetFlatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              workspaceId,
            );
    }

    const fieldMetadata = Object.keys(record)
      .map((recordFieldName) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[recordFieldName],
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);

    const objectRecordProcessedWithoutRelationFields =
      await this.processObjectRecordWithoutRelationFields(
        record,
        workspaceId,
        handlers,
        fieldMetadata,
      );

    const processedRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };

    return processedRecord;
  }

  private async processObjectRecordWithoutRelationFields(
    record: ObjectRecord,
    workspaceId: string,
    handlers: QueryResultGetterHandlerInterface[],
    fieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    let processedRecord = record;

    for (const handler of handlers) {
      processedRecord = await handler.handle(
        processedRecord,
        workspaceId,
        fieldMetadata,
      );
    }

    return processedRecord;
  }

  private getObjectHandler(
    objectType: string,
  ): QueryResultGetterHandlerInterface {
    return (
      (this.objectHandlers.get(objectType) || {
        handle: (result: ObjectRecord): Promise<ObjectRecord> =>
          Promise.resolve(result),
      }) ?? {
        handle: (result: ObjectRecord): Promise<ObjectRecord> =>
          Promise.resolve(result),
      }
    );
  }
}
