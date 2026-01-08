import { Injectable, Logger } from '@nestjs/common';

import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type UpsertRecordParams } from 'src/engine/core-modules/record-crud/types/upsert-record-params.type';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class UpsertRecordService {
  private readonly logger = new Logger(UpsertRecordService.name);

  constructor(
    private readonly commonCreateOneRunner: CommonCreateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: UpsertRecordParams): Promise<ToolOutput> {
    const { objectName, objectRecord, authContext } = params;

    try {
      const { queryRunnerContext, selectedFields, flatObjectMetadata } =
        await this.commonApiContextBuilder.build({
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

      // Clean undefined values from the record data (including nested composite fields)
      // This prevents validation errors for partial composite field inputs
      const cleanedRecord = removeUndefinedFromRecord(objectRecord);

      // Use Common API with upsert flag - it handles conflict detection automatically
      const upsertedRecord = await this.commonCreateOneRunner.execute(
        {
          data: cleanedRecord,
          selectedFields,
          upsert: true,
        },
        queryRunnerContext,
      );

      this.logger.log(`Record upserted successfully in ${objectName}`);

      return {
        success: true,
        message: `Record upserted successfully in ${objectName}`,
        result: upsertedRecord,
      };
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to upsert record in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to upsert record: ${error}`);

      return {
        success: false,
        message: `Failed to upsert record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to upsert record',
      };
    }
  }
}
