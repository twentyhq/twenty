import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class ApiEventEmitterService {
  constructor(private readonly workspaceEventEmitter: WorkspaceEventEmitter) {}

  public emitCreateEvents<T extends ObjectRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): void {
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      action: DatabaseEventAction.CREATED,
      events: records.map((record) => ({
        userId: authContext.user?.id,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          before: null,
          after: record,
        },
      })),
      workspaceId: authContext.workspace.id,
    });
  }

  public emitUpdateEvents<T extends ObjectRecord>(
    existingRecords: T[],
    records: T[],
    updatedFields: string[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): void {
    const mappedExistingRecords = existingRecords.reduce(
      (acc, { id, ...record }) => ({
        ...acc,
        [id]: record,
      }),
      {},
    );

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      action: DatabaseEventAction.UPDATED,
      events: records.map((record) => {
        const before = mappedExistingRecords[record.id];
        const after = record;
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
      workspaceId: authContext.workspace.id,
    });
  }

  public emitDeletedEvents<T extends ObjectRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): void {
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      action: DatabaseEventAction.DELETED,
      events: records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: record,
            after: null,
          },
        };
      }),
      workspaceId: authContext.workspace.id,
    });
  }

  public emitRestoreEvents<T extends ObjectRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): void {
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      action: DatabaseEventAction.RESTORED,
      events: records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: null,
            after: record,
          },
        };
      }),
      workspaceId: authContext.workspace.id,
    });
  }

  public emitDestroyEvents<T extends ObjectRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): void {
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      action: DatabaseEventAction.DESTROYED,
      events: records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: record,
            after: null,
          },
        };
      }),
      workspaceId: authContext.workspace.id,
    });
  }
}
