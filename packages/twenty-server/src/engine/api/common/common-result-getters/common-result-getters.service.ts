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
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ResultGettersArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  workspaceId: string;
  selection: CommonSelection;
};

type ResultProcessingContext = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  workspaceId: string;
  fieldMetadataByNameByObjectMetadataId: Map<
    string,
    ReadonlyMap<string, OrmFlatFieldMetadata>
  >;
};

type RecordProcessingArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  selection: CommonSelection;
  context: ResultProcessingContext;
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

  public processRecordArray({
    records,
    ...resultGettersArgs
  }: ResultGettersArgs & { records: ObjectRecord[] }): Promise<ObjectRecord[]> {
    return this.processRecordArrayWithContext({
      records,
      flatObjectMetadata: resultGettersArgs.flatObjectMetadata,
      selection: resultGettersArgs.selection,
      context: this.buildContext(resultGettersArgs),
    });
  }

  public processRecord({
    record,
    ...resultGettersArgs
  }: ResultGettersArgs & { record: ObjectRecord }): Promise<ObjectRecord> {
    return this.processRecordWithContext({
      record,
      flatObjectMetadata: resultGettersArgs.flatObjectMetadata,
      selection: resultGettersArgs.selection,
      context: this.buildContext(resultGettersArgs),
    });
  }

  private buildContext({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    workspaceId,
  }: Pick<
    ResultGettersArgs,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'workspaceId'
  >): ResultProcessingContext {
    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId,
      fieldMetadataByNameByObjectMetadataId: new Map(),
    };
  }

  private processRecordArrayWithContext({
    records,
    flatObjectMetadata,
    selection,
    context,
  }: RecordProcessingArgs & { records: ObjectRecord[] }): Promise<
    ObjectRecord[]
  > {
    return Promise.all(
      records.map((record) =>
        this.processRecordWithContext({
          record,
          flatObjectMetadata,
          selection,
          context,
        }),
      ),
    );
  }

  private async processRecordWithContext({
    record,
    flatObjectMetadata,
    selection,
    context,
  }: RecordProcessingArgs & { record: ObjectRecord }): Promise<ObjectRecord> {
    const fieldMetadataByName = this.getOrBuildFieldMetadataByName(
      flatObjectMetadata,
      context,
    );
    const recordFieldMetadataList = Object.keys(record)
      .map((recordFieldName) => fieldMetadataByName.get(recordFieldName))
      .filter(isDefined);

    const fieldHandlers = new Set(
      recordFieldMetadataList
        .map((recordFieldMetadata) =>
          this.fieldHandlers.get(recordFieldMetadata.type),
        )
        .filter(isDefined),
    );

    const handlers = [
      this.getObjectHandler(flatObjectMetadata.nameSingular),
      ...fieldHandlers,
    ];

    const relationFieldsProcessedMap = {} as Record<
      string,
      QueryResultFieldValue
    >;

    for (const { key, relationSelection } of getRelationSelectionEntries(
      selection,
    )) {
      const relationField = fieldMetadataByName.get(
        relationSelection.fieldName,
      );
      const recordFieldValue = record[key];

      if (
        !isDefined(relationField) ||
        !isFlatFieldMetadataOfType(relationField, FieldMetadataType.RELATION)
      ) {
        continue;
      }

      if (!isDefined(relationField.relationTargetObjectMetadataId)) {
        throw new Error('Relation target object metadata id is not defined');
      }

      if (!isDefined(recordFieldValue)) {
        continue;
      }

      const targetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationField.relationTargetObjectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        });

      relationFieldsProcessedMap[key] =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? await this.processRecordArrayWithContext({
              records: recordFieldValue,
              flatObjectMetadata: targetFlatObjectMetadata,
              selection: relationSelection.selection,
              context,
            })
          : await this.processRecordWithContext({
              record: recordFieldValue,
              flatObjectMetadata: targetFlatObjectMetadata,
              selection: relationSelection.selection,
              context,
            });
    }

    const objectRecordProcessedWithoutRelationFields =
      await this.processObjectRecordWithoutRelationFields(
        record,
        context.workspaceId,
        handlers,
        recordFieldMetadataList,
      );

    return {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };
  }

  private getOrBuildFieldMetadataByName(
    flatObjectMetadata: FlatObjectMetadata,
    context: ResultProcessingContext,
  ): ReadonlyMap<string, OrmFlatFieldMetadata> {
    const cachedFieldMetadataByName =
      context.fieldMetadataByNameByObjectMetadataId.get(flatObjectMetadata.id);

    if (isDefined(cachedFieldMetadataByName)) {
      return cachedFieldMetadataByName;
    }

    const fieldMetadataByName = new Map(
      getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        context.flatFieldMetadataMaps,
      ).map((fieldMetadata) => [fieldMetadata.name, fieldMetadata]),
    );

    context.fieldMetadataByNameByObjectMetadataId.set(
      flatObjectMetadata.id,
      fieldMetadataByName,
    );

    return fieldMetadataByName;
  }

  private async processObjectRecordWithoutRelationFields(
    record: ObjectRecord,
    workspaceId: string,
    handlers: QueryResultGetterHandlerInterface[],
    fieldMetadata: OrmFlatFieldMetadata[],
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
      this.objectHandlers.get(objectType) ?? {
        handle: (result: ObjectRecord): Promise<ObjectRecord> =>
          Promise.resolve(result),
      }
    );
  }
}
