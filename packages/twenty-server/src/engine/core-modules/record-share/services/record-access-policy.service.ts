/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { evaluateRowAccessPolicy } from 'src/engine/core-modules/record-share/utils/evaluate-row-access-policy.util';
import { resolveEventRecordSnapshots } from 'src/engine/core-modules/record-share/utils/resolve-event-record-snapshots.util';
import { buildRowAccessPolicy } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  // A subject receives the records a query would return it: the event
  // snapshots are run through the same row access policy as its queries.
  buildEventRecordAccessGate({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<ObjectRecordEvent>): EventRecordAccessGate {
    // One lookup per object for the whole batch: operands only ever ask for
    // records of the batch, so later calls are served from what was fetched
    const recordSharesByRecordIdByObject = new Map<
      string,
      Map<string, Promise<RecordShare[]>>
    >();
    const fetchRecordShares = async ({
      objectMetadataId,
      recordIds,
    }: {
      objectMetadataId: string;
      recordIds: string[];
    }) => {
      const recordSharesByRecordId =
        recordSharesByRecordIdByObject.get(objectMetadataId) ??
        new Map<string, Promise<RecordShare[]>>();

      recordSharesByRecordIdByObject.set(
        objectMetadataId,
        recordSharesByRecordId,
      );

      const uniqueRecordIds = [...new Set(recordIds)];
      const missingRecordIds = uniqueRecordIds.filter(
        (recordId) => !recordSharesByRecordId.has(recordId),
      );

      if (missingRecordIds.length > 0) {
        const groupedRecordShares = this.recordShareStorageService
          .findByRecordIds({
            workspaceId,
            objectMetadataId,
            recordIds: missingRecordIds,
          })
          .then((recordShares) =>
            groupBy(recordShares, (recordShare) => recordShare.recordId),
          );

        for (const recordId of missingRecordIds) {
          recordSharesByRecordId.set(
            recordId,
            groupedRecordShares.then(
              (recordSharesOfRecord) => recordSharesOfRecord[recordId] ?? [],
            ),
          );
        }
      }

      const recordSharesPerRecord = await Promise.all(
        uniqueRecordIds.map(
          (recordId) => recordSharesByRecordId.get(recordId) ?? [],
        ),
      );

      return recordSharesPerRecord.flat();
    };

    return {
      resolveAdmittedRecordIds: async (subject) => {
        const {
          flatObjectMetadataMaps,
          flatFieldMetadataMapsOrm,
          featureFlagsMap,
        } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMapsOrm',
          'featureFlagsMap',
        ]);
        return evaluateRowAccessPolicy({
          policy: buildRowAccessPolicy({
            subject,
            environment: {
              flatObjectMetadataMaps,
              flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
              featureFlagsMap,
            },
            tableAlias: objectMetadata.nameSingular,
            flatObjectMetadata: objectMetadata,
            operationType: 'select',
          }),
          records: resolveEventRecordSnapshots(events),
          context: {
            flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
            shouldIgnoreSoftDeleteDefaultFilter: true,
            fetchRecordShares,
          },
        });
      },
    };
  }
}
