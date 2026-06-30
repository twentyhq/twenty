import { Injectable, Logger } from '@nestjs/common';

import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type DeleteManyRecordsParams } from 'src/engine/core-modules/record-crud/types/delete-many-records-params.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

@Injectable()
export class DeleteManyRecordsService {
  private readonly logger = new Logger(DeleteManyRecordsService.name);

  constructor(
    private readonly commonDeleteManyRunner: CommonDeleteManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: DeleteManyRecordsParams): Promise<ToolOutput> {
    const { objectName, filter, authContext } = params;

    if (!isDefined(filter) || isEmptyObject(filter)) {
      return {
        success: false,
        message: `Failed to delete records from ${objectName}`,
        error:
          'Filter must not be empty — deleting without a filter is not allowed',
      };
    }

    try {
      const { queryRunnerContext, selectedFields, flatObjectMetadata } =
        await this.commonApiContextBuilder.build({
          authContext,
          objectName,
        });

      if (
        !canObjectBeManagedByAutomation({
          nameSingular: flatObjectMetadata.nameSingular,
        })
      ) {
        throw new RecordCrudException(
          'Failed to delete: Object cannot be deleted by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const { results: deletedRecords } =
        await this.commonDeleteManyRunner.execute(
          { filter, selectedFields },
          queryRunnerContext,
        );

      this.logger.log(
        `Soft deleted ${deletedRecords.length} records from ${objectName}`,
      );

      return {
        success: true,
        message: `Soft deleted ${deletedRecords.length} records from ${objectName}`,
        result: deletedRecords.map((record) => ({ id: record.id })),
      };
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to delete records from ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to delete records: ${error}`);

      return {
        success: false,
        message: `Failed to delete records from ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to delete records',
      };
    }
  }
}
