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
import { RichTextFieldQueryResultGetterHandler } from 'src/engine/api/common/common-result-getters/handlers/field-handlers/rich-text-field-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ProcessingContext = {
  workspaceId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  fieldMetadataByNameByObjectId: Map<string, Map<string, FlatFieldMetadata>>;
};

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

  constructor(private readonly fileUrlService: FileUrlService) {
    this.initializeObjectHandlers();
    this.initializeFieldHandlers();
  }

  private initializeObjectHandlers() {
    this.objectHandlers = new Map<string, QueryResultGetterHandlerInterface>([
      [
        'workspaceMember',
        new WorkspaceMemberQueryResultGetterHandler(this.fileUrlService),
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
        new FilesFieldQueryResultGetterHandler(this.fileUrlService),
      ],
      [
        FieldMetadataType.RICH_TEXT,
        new RichTextFieldQueryResultGetterHandler(this.fileUrlService),
      ],
    ]);
  }

  public processRecordArray(
    recordArray: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
  ): Promise<ObjectRecord[]> {
    return this.processRecordArrayWithContext(
      recordArray,
      flatObjectMetadata,
      this.createProcessingContext({
        workspaceId,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    );
  }

  public processRecord(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
  ): Promise<ObjectRecord> {
    return this.processRecordWithContext(
      record,
      flatObjectMetadata,
      this.createProcessingContext({
        workspaceId,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    );
  }

  private processRecordArrayWithContext(
    recordArray: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    processingContext: ProcessingContext,
  ): Promise<ObjectRecord[]> {
    return Promise.all(
      recordArray.map((record) =>
        this.processRecordWithContext(
          record,
          flatObjectMetadata,
          processingContext,
        ),
      ),
    );
  }

  private async processRecordWithContext(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    processingContext: ProcessingContext,
  ): Promise<ObjectRecord> {
    const fieldMetadataByName = this.getOrBuildFieldMetadataByName(
      flatObjectMetadata,
      processingContext,
    );
    const fieldMetadata = Object.keys(record)
      .map((recordFieldName) => fieldMetadataByName.get(recordFieldName))
      .filter(isDefined);

    const handlers = [
      this.getObjectHandler(flatObjectMetadata.nameSingular),
      ...fieldMetadata
        .map((fieldMetadata) => this.fieldHandlers.get(fieldMetadata.type))
        .filter(isDefined),
    ];

    const relationFields = fieldMetadata.filter((fieldMetadata) =>
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
          flatEntityMaps: processingContext.flatObjectMetadataMaps,
        });

      relationFieldsProcessedMap[relationField.name] =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? await this.processRecordArrayWithContext(
              record[relationField.name],
              targetFlatObjectMetadata,
              processingContext,
            )
          : await this.processRecordWithContext(
              record[relationField.name],
              targetFlatObjectMetadata,
              processingContext,
            );
    }

    const objectRecordProcessedWithoutRelationFields =
      await this.processObjectRecordWithoutRelationFields(
        record,
        processingContext.workspaceId,
        handlers,
        fieldMetadata,
      );

    const processedRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };

    return processedRecord;
  }

  private createProcessingContext({
    workspaceId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): ProcessingContext {
    return {
      workspaceId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      fieldMetadataByNameByObjectId: new Map(),
    };
  }

  private getOrBuildFieldMetadataByName(
    flatObjectMetadata: FlatObjectMetadata,
    processingContext: ProcessingContext,
  ): Map<string, FlatFieldMetadata> {
    const cachedFieldMetadataByName =
      processingContext.fieldMetadataByNameByObjectId.get(
        flatObjectMetadata.id,
      );

    if (isDefined(cachedFieldMetadataByName)) {
      return cachedFieldMetadataByName;
    }

    const fieldMetadataByName = new Map(
      getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        processingContext.flatFieldMetadataMaps,
      ).map((fieldMetadata) => [fieldMetadata.name, fieldMetadata]),
    );

    processingContext.fieldMetadataByNameByObjectId.set(
      flatObjectMetadata.id,
      fieldMetadataByName,
    );

    return fieldMetadataByName;
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
