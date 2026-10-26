import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { Injectable } from '@nestjs/common';
import { workspaceContextStorage } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

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
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ResultProcessingContext = {
  fileReadableRecordIds?: Map<string, Set<string>>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  workspaceId: string;
  fieldMetadataByNameByObjectMetadataId: Map<
    string,
    ReadonlyMap<string, OrmFlatFieldMetadata>
  >;
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

  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {
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

  public async processRecordArray(
    recordArray: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    workspaceId: string,
  ): Promise<ObjectRecord[]> {
    const context: ResultProcessingContext = {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId,
      fieldMetadataByNameByObjectMetadataId: new Map(),
    };
    await this.authorizeFileLinks(recordArray, flatObjectMetadata, context);
    return this.processRecordArrayWithContext(
      recordArray,
      flatObjectMetadata,
      context,
    );
  }

  public async processRecord(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    workspaceId: string,
  ): Promise<ObjectRecord> {
    const [result] = await this.processRecordArray(
      [record],
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId,
    );

    return result;
  }

  private async authorizeFileLinks(
    records: ObjectRecord[],
    object: FlatObjectMetadata,
    context: ResultProcessingContext,
  ): Promise<void> {
    const workspaceContext = workspaceContextStorage.getStore();

    if (
      !isDefined(workspaceContext?.recordPermissionContext) ||
      workspaceContext.authContext.type === 'system'
    )
      return;
    const targets = new Map<
      string,
      { object: FlatObjectMetadata; ids: Set<string> }
    >();
    const collect = (
      record: ObjectRecord,
      currentObject: FlatObjectMetadata,
    ): void => {
      const fields = this.getOrBuildFieldMetadataByName(currentObject, context);

      for (const [name, value] of Object.entries(record)) {
        const field = fields.get(name);

        if (!isDefined(field) || !isDefined(value)) continue;
        if (
          [FieldMetadataType.FILES, FieldMetadataType.RICH_TEXT].includes(
            field.type,
          )
        ) {
          const target = targets.get(currentObject.id) ?? {
            object: currentObject,
            ids: new Set<string>(),
          };

          if (typeof record.id === 'string') target.ids.add(record.id);
          targets.set(currentObject.id, target);
        }
        if (
          isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) &&
          isDefined(field.relationTargetObjectMetadataId)
        ) {
          const relatedObject = findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: field.relationTargetObjectMetadataId,
            flatEntityMaps: context.flatObjectMetadataMaps,
          });

          for (const related of Array.isArray(value) ? value : [value]) {
            if (isDefined(related)) collect(related, relatedObject);
          }
        }
      }
    };

    records.forEach((record) => collect(record, object));
    context.fileReadableRecordIds = new Map();
    for (const { object: targetObject, ids } of targets.values()) {
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          targetObject.nameSingular,
        );
      const recordIds = [...ids];
      const allowed = new Set<string>();

      for (
        let offset = 0;
        offset < recordIds.length;
        offset += QUERY_MAX_RECORDS
      ) {
        const admitted =
          await repository.findRecordIdsAllowedForRecordPermissionAction({
            recordIds: recordIds.slice(offset, offset + QUERY_MAX_RECORDS),
            action: 'read',
          });

        for (const id of admitted ?? []) allowed.add(id);
      }
      context.fileReadableRecordIds.set(targetObject.id, allowed);
    }
  }

  private processRecordArrayWithContext(
    recordArray: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    context: ResultProcessingContext,
  ): Promise<ObjectRecord[]> {
    return Promise.all(
      recordArray.map((record) =>
        this.processRecordWithContext(record, flatObjectMetadata, context),
      ),
    );
  }

  private async processRecordWithContext(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    context: ResultProcessingContext,
  ): Promise<ObjectRecord> {
    const fieldMetadataByName = this.getOrBuildFieldMetadataByName(
      flatObjectMetadata,
      context,
    );
    const recordFieldMetadataList = Object.keys(record)
      .map((recordFieldName) => fieldMetadataByName.get(recordFieldName))
      .filter(isDefined);

    const canIssueFileLinks =
      !isDefined(context.fileReadableRecordIds) ||
      context.fileReadableRecordIds
        .get(flatObjectMetadata.id)
        ?.has(record.id) === true;
    const fieldHandlers = new Set(
      (canIssueFileLinks ? recordFieldMetadataList : [])
        .map((recordFieldMetadata) =>
          this.fieldHandlers.get(recordFieldMetadata.type),
        )
        .filter(isDefined),
    );

    const handlers = [
      this.getObjectHandler(flatObjectMetadata.nameSingular),
      ...fieldHandlers,
    ];

    const relationFields = recordFieldMetadataList.filter(
      (recordFieldMetadata) =>
        isFlatFieldMetadataOfType(
          recordFieldMetadata,
          FieldMetadataType.RELATION,
        ),
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
          flatEntityMaps: context.flatObjectMetadataMaps,
        });

      relationFieldsProcessedMap[relationField.name] =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? await this.processRecordArrayWithContext(
              record[relationField.name],
              targetFlatObjectMetadata,
              context,
            )
          : await this.processRecordWithContext(
              record[relationField.name],
              targetFlatObjectMetadata,
              context,
            );
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
