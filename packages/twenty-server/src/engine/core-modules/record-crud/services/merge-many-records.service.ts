import { Injectable, Logger } from '@nestjs/common';

import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type MergeManyRecordsParams } from 'src/engine/core-modules/record-crud/types/merge-many-records-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class MergeManyRecordsService {
  private readonly logger = new Logger(MergeManyRecordsService.name);

  constructor(
    private readonly commonMergeManyRunner: CommonMergeManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: MergeManyRecordsParams): Promise<ToolOutput> {
    const {
      objectName,
      ids,
      conflictPriorityIndex,
      dryRun,
      authContext,
      rolePermissionConfig,
    } = params;

    try {
      const {
        queryRunnerContext,
        selectedFields,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
        rolePermissionConfig,
      });

      if (
        !canObjectBeManagedByAutomation({
          nameSingular: flatObjectMetadata.nameSingular,
        })
      ) {
        throw new RecordCrudException(
          'Failed to merge: Object cannot be merged by automation',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const { results: mergedRecord } =
        await this.commonMergeManyRunner.execute(
          { ids, conflictPriorityIndex, dryRun, selectedFields },
          queryRunnerContext,
        );

      const keptRecordId = ids[conflictPriorityIndex];

      if (dryRun) {
        return {
          success: true,
          message: `Preview of merging ${ids.length} records from ${objectName} into ${keptRecordId}. Nothing was changed. Records linked to the other records will be moved to the kept record.`,
          result: { ...mergedRecord, id: keptRecordId, deletedAt: null },
        };
      }

      this.logger.log(
        `Merged ${ids.length} records from ${objectName} into ${keptRecordId}`,
      );

      return {
        success: true,
        message: `Merged ${ids.length} records from ${objectName} into ${keptRecordId}`,
        result: mergedRecord,
        recordReferences: [
          {
            objectNameSingular: objectName,
            recordId: mergedRecord.id,
            displayName: getRecordDisplayName(
              mergedRecord,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to merge records from ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to merge records: ${error}`);

      return {
        success: false,
        message: `Failed to merge records from ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to merge records',
      };
    }
  }
}
