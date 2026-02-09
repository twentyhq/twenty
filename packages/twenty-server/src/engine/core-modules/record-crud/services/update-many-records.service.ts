import { Injectable, Logger } from '@nestjs/common';

import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type UpdateManyRecordsParams } from 'src/engine/core-modules/record-crud/types/update-many-records-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class UpdateManyRecordsService {
  private readonly logger = new Logger(UpdateManyRecordsService.name);

  constructor(
    private readonly commonUpdateManyRunner: CommonUpdateManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: UpdateManyRecordsParams): Promise<ToolOutput> {
    const { objectName, filter, data, authContext } = params;

    try {
      const {
        queryRunnerContext,
        selectedFields,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
      });

      if (
        !canObjectBeManagedByWorkflow({
          nameSingular: flatObjectMetadata.nameSingular,
          isSystem: flatObjectMetadata.isSystem,
        })
      ) {
        throw new RecordCrudException(
          'Failed to update: Object cannot be updated by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const cleanedData = removeUndefinedFromRecord(data);

      const updatedRecords = await this.commonUpdateManyRunner.execute(
        { filter, data: cleanedData, selectedFields },
        queryRunnerContext,
      );

      this.logger.log(
        `Updated ${updatedRecords.length} records in ${objectName}`,
      );

      return {
        success: true,
        message: `Updated ${updatedRecords.length} records in ${objectName}`,
        result: params.slimResponse
          ? updatedRecords.map((record) => ({ id: record.id }))
          : updatedRecords,
        recordReferences: updatedRecords.map((record) => ({
          objectNameSingular: objectName,
          recordId: record.id,
          displayName: getRecordDisplayName(
            record,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          ),
        })),
      };
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to update records in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to update records: ${error}`);

      return {
        success: false,
        message: `Failed to update records in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to update records',
      };
    }
  }
}
