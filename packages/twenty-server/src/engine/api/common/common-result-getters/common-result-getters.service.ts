import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { isQueryResultFieldValueARecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-record-array.guard';
import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class CommonResultGettersService {
  private readonly logger = new Logger(CommonResultGettersService.name);
  private handlers: Map<string, QueryResultGetterHandlerInterface>;

  constructor(private readonly fileService: FileService) {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.handlers = new Map<string, QueryResultGetterHandlerInterface>([
      ['attachment', new AttachmentQueryResultGetterHandler(this.fileService)],
      ['person', new PersonQueryResultGetterHandler(this.fileService)],
      [
        'workspaceMember',
        new WorkspaceMemberQueryResultGetterHandler(this.fileService),
      ],
      ['note', new ActivityQueryResultGetterHandler(this.fileService)],
      ['task', new ActivityQueryResultGetterHandler(this.fileService)],
    ]);
  }

  private async processRecordArray(
    recordArray: ObjectRecord[],
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ) {
    return await Promise.all(
      recordArray.map(
        async (record: ObjectRecord) =>
          await this.processRecord(
            record,
            objectMetadataItemId,
            objectMetadataMaps,
            workspaceId,
          ),
      ),
    );
  }

  private async processRecord(
    record: ObjectRecord,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<ObjectRecord> {
    const objectMetadataMapItem = objectMetadataMaps.byId[objectMetadataItemId];

    if (!isDefined(objectMetadataMapItem)) {
      throw new Error('Object metadata map item is not defined');
    }

    const handler = this.getHandler(objectMetadataMapItem.nameSingular);

    const relationFields = Object.keys(record)
      .map(
        (recordFieldName) =>
          objectMetadataMapItem.fieldsById[
            objectMetadataMapItem.fieldIdByName[recordFieldName]
          ],
      )
      .filter(isDefined)
      .filter((fieldMetadata) =>
        isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION),
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

      relationFieldsProcessedMap[relationField.name] =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? await this.processRecordArray(
              record[relationField.name],
              relationField.relationTargetObjectMetadataId,
              objectMetadataMaps,
              workspaceId,
            )
          : await this.processRecord(
              record[relationField.name],
              relationField.relationTargetObjectMetadataId,
              objectMetadataMaps,
              workspaceId,
            );
    }

    const objectRecordProcessedWithoutRelationFields = await handler.handle(
      record,
      workspaceId,
    );

    const processedRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };

    return processedRecord;
  }

  async processQueryResult(
    queryResultField: ObjectRecord[],
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
  ): Promise<ObjectRecord[]> {
    if (isQueryResultFieldValueARecordArray(queryResultField)) {
      return await this.processRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMaps,
        workspaceId,
      );
    } else {
      this.logger.warn(
        `Query result field is not a record array. This is an undetected case in query result getter that should be implemented !!`,
      );

      return queryResultField;
    }
  }

  private getHandler(objectType: string): QueryResultGetterHandlerInterface {
    return (
      this.handlers.get(objectType) || {
        handle: (result: ObjectRecord): Promise<ObjectRecord> =>
          Promise.resolve(result),
      }
    );
  }
}
