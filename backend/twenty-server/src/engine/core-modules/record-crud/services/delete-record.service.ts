import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type DeleteRecordParams } from 'src/engine/core-modules/record-crud/types/delete-record-params.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class DeleteRecordService {
  private readonly logger = new Logger(DeleteRecordService.name);

  constructor(
    private readonly commonDeleteOneRunner: CommonDeleteOneQueryRunnerService,
    private readonly commonDestroyOneRunner: CommonDestroyOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: DeleteRecordParams): Promise<ToolOutput> {
    const { objectName, objectRecordId, authContext, soft = true } = params;

    if (!isDefined(objectRecordId) || !isValidUuid(objectRecordId)) {
      return {
        success: false,
        message: 'Failed to delete: Object record ID must be a valid UUID',
        error: 'Invalid object record ID',
      };
    }

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
          'Failed to delete: Object cannot be deleted by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      if (soft) {
        const deletedRecord = await this.commonDeleteOneRunner.execute(
          {
            id: objectRecordId,
            selectedFields,
          },
          queryRunnerContext,
        );

        this.logger.log(`Record soft deleted successfully from ${objectName}`);

        return {
          success: true,
          message: `Record soft deleted successfully from ${objectName}`,
          result: deletedRecord,
        };
      } else {
        const destroyedRecord = await this.commonDestroyOneRunner.execute(
          {
            id: objectRecordId,
            selectedFields,
          },
          queryRunnerContext,
        );

        this.logger.log(
          `Record permanently deleted successfully from ${objectName}`,
        );

        return {
          success: true,
          message: `Record permanently deleted successfully from ${objectName}`,
          result: destroyedRecord,
        };
      }
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to delete record from ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to delete record: ${error}`);

      return {
        success: false,
        message: `Failed to delete record from ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to delete record',
      };
    }
  }
}
