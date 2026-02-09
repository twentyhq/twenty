import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type CreateManyRecordsParams } from 'src/engine/core-modules/record-crud/types/create-many-records-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class CreateManyRecordsService {
  private readonly logger = new Logger(CreateManyRecordsService.name);

  constructor(
    private readonly commonCreateManyRunner: CommonCreateManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: CreateManyRecordsParams): Promise<ToolOutput> {
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
        !canObjectBeManagedByWorkflow({
          nameSingular: flatObjectMetadata.nameSingular,
          isSystem: flatObjectMetadata.isSystem,
        })
      ) {
        throw new RecordCrudException(
          'Failed to create: Object cannot be created by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const actorMetadata = params.createdBy ?? {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      };

      const cleanedRecords = objectRecords.map((record) => ({
        ...removeUndefinedFromRecord(record),
        createdBy: actorMetadata,
      }));

      const createdRecords = await this.commonCreateManyRunner.execute(
        {
          data: cleanedRecords,
          selectedFields,
        },
        queryRunnerContext,
      );

      this.logger.log(
        `Created ${createdRecords.length} records in ${objectName}`,
      );

      return {
        success: true,
        message: `Created ${createdRecords.length} records in ${objectName}`,
        result: params.slimResponse
          ? createdRecords.map((record) => ({ id: record.id }))
          : createdRecords,
        recordReferences: createdRecords.map((record) => ({
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
          message: `Failed to create records in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to create records: ${error}`);

      return {
        success: false,
        message: `Failed to create records in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to create records',
      };
    }
  }
}
