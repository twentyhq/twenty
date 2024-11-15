import { Injectable } from '@nestjs/common';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class ApiEventEmitterService {
  constructor(private readonly workspaceEventEmitter: WorkspaceEventEmitter) {}

  public emitCreateEvents<T extends IRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.${DatabaseEventAction.CREATED}`,
      records.map((record) => ({
        userId: authContext.user?.id,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          before: null,
          after: this.removeGraphQLAndNestedProperties(record),
        },
      })),
      authContext.workspace.id,
    );
  }

  public emitUpdateEvents<T extends IRecord>(
    existingRecords: T[],
    records: T[],
    updatedFields: string[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    const mappedExistingRecords = existingRecords.reduce(
      (acc, { id, ...record }) => ({
        ...acc,
        [id]: record,
      }),
      {},
    );

    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.${DatabaseEventAction.UPDATED}`,
      records.map((record) => {
        const before = this.removeGraphQLAndNestedProperties(
          mappedExistingRecords[record.id],
        );
        const after = this.removeGraphQLAndNestedProperties(record);
        const diff = objectRecordChangedValues(
          before,
          after,
          updatedFields,
          objectMetadataItem,
        );

        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before,
            after,
            updatedFields,
            diff,
          },
        };
      }),
      authContext.workspace.id,
    );
  }

  public emitDeletedEvents<T extends IRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.${DatabaseEventAction.DELETED}`,
      records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: this.removeGraphQLAndNestedProperties(record),
            after: null,
          },
        };
      }),
      authContext.workspace.id,
    );
  }

  public emitDestroyEvents<T extends IRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.${DatabaseEventAction.DESTROYED}`,
      records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: this.removeGraphQLAndNestedProperties(record),
            after: null,
          },
        };
      }),
      authContext.workspace.id,
    );
  }

  private removeGraphQLAndNestedProperties<ObjectRecord extends IRecord>(
    record: ObjectRecord,
  ) {
    if (!record) {
      return {};
    }

    const sanitizedRecord = {};

    for (const [key, value] of Object.entries(record)) {
      if (value && typeof value === 'object' && value['edges']) {
        continue;
      }

      if (key === '__typename') {
        continue;
      }

      sanitizedRecord[key] = value;
    }

    return sanitizedRecord;
  }
}
