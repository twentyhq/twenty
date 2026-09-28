import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type MergeRecordsParams } from 'src/engine/core-modules/record-crud/types/merge-records-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class MergeRecordsService {
  private readonly logger = new Logger(MergeRecordsService.name);

  constructor(
    private readonly commonMergeManyRunner: CommonMergeManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: MergeRecordsParams): Promise<ToolOutput> {
    const {
      objectName,
      ids,
      conflictPriorityIndex,
      dryRun = false,
      authContext,
      rolePermissionConfig,
    } = params;

    if (!Array.isArray(ids) || ids.length < 2) {
      return {
        success: false,
        message: 'Failed to merge: At least two record IDs are required',
        error: 'Invalid record IDs',
      };
    }

    for (const id of ids) {
      if (!isDefined(id) || !isValidUuid(id)) {
        return {
          success: false,
          message: 'Failed to merge: Each record ID must be a valid UUID',
          error: 'Invalid object record ID',
        };
      }
    }

    if (
      typeof conflictPriorityIndex !== 'number' ||
      conflictPriorityIndex < 0 ||
      conflictPriorityIndex >= ids.length
    ) {
      return {
        success: false,
        message: `Failed to merge: conflictPriorityIndex must be between 0 and ${ids.length - 1}`,
        error: 'Invalid conflict priority index',
      };
    }

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
          'Failed to merge: Object cannot be updated by automation',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      if (!isDefined(flatObjectMetadata.duplicateCriteria)) {
        throw new RecordCrudException(
          'Failed to merge: Object does not support record merging',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const { results: mergedRecord } =
        await this.commonMergeManyRunner.execute(
          {
            ids,
            conflictPriorityIndex,
            dryRun,
            selectedFields,
          },
          queryRunnerContext,
        );

      this.logger.log(`Records merged successfully in ${objectName}`);

      const survivingRecordId = ids[conflictPriorityIndex];

      return {
        success: true,
        message: dryRun
          ? `Merge simulated successfully in ${objectName}`
          : `Records merged successfully in ${objectName}`,
        result: mergedRecord,
        recordReferences: [
          {
            objectNameSingular: objectName,
            recordId: survivingRecordId,
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
          message: `Failed to merge records in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to merge records: ${error}`);

      return {
        success: false,
        message: `Failed to merge records in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to merge records',
      };
    }
  }
}
