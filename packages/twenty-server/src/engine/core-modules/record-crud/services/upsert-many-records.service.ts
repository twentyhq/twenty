import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type UpsertManyRecordsParams } from 'src/engine/core-modules/record-crud/types/upsert-many-records-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

@Injectable()
export class UpsertManyRecordsService {
  private readonly logger = new Logger(UpsertManyRecordsService.name);

  constructor(
    private readonly commonCreateManyRunner: CommonCreateManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: UpsertManyRecordsParams): Promise<ToolOutput> {
    const { objectName, objectRecords, authContext } = params;

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
        !canObjectBeManagedByAutomation({
          nameSingular: flatObjectMetadata.nameSingular,
        })
      ) {
        throw new RecordCrudException(
          'Failed to upsert: Object cannot be upserted by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const cleanedRecords = objectRecords.map((record) => ({
        ...removeUndefinedFromRecord(record),
        ...(isDefined(params.createdBy) && { createdBy: params.createdBy }),
      }));

      const { results: upsertedRecords } =
        await this.commonCreateManyRunner.execute(
          {
            data: cleanedRecords,
            selectedFields,
            upsert: true,
          },
          queryRunnerContext,
        );

      this.logger.log(
        `Upserted ${upsertedRecords.length} records in ${objectName}`,
      );

      return {
        success: true,
        message: `Upserted ${upsertedRecords.length} records in ${objectName}`,
        result: params.slimResponse
          ? upsertedRecords.map((record) => ({ id: record.id }))
          : upsertedRecords,
        recordReferences: upsertedRecords.map((record) => ({
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
          message: `Failed to upsert records in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to upsert records: ${error}`);

      return {
        success: false,
        message: `Failed to upsert records in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to upsert records',
      };
    }
  }
}
