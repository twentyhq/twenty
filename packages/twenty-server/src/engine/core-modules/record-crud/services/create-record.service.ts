import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type CreateRecordParams } from 'src/engine/core-modules/record-crud/types/create-record-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class CreateRecordService {
  private readonly logger = new Logger(CreateRecordService.name);

  constructor(
    private readonly commonCreateOneRunner: CommonCreateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: CreateRecordParams): Promise<ToolOutput> {
    const { objectName, objectRecord, authContext } = params;

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

      // Pass createdBy explicitly if provided (for workflows)
      // Common API hook will also inject createdBy from authContext if available
      const actorMetadata = params.createdBy ?? {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      };

      // Clean undefined values from the record data (including nested composite fields)
      // This prevents validation errors for partial composite field inputs
      const cleanedRecord = removeUndefinedFromRecord(objectRecord);
      const dataWithActor = { ...cleanedRecord, createdBy: actorMetadata };

      const createdRecord = await this.commonCreateOneRunner.execute(
        {
          data: dataWithActor,
          selectedFields,
        },
        queryRunnerContext,
      );

      this.logger.log(`Record created successfully in ${objectName}`);

      return {
        success: true,
        message: `Record created successfully in ${objectName}`,
        result: createdRecord,
        recordReferences: [
          {
            objectNameSingular: objectName,
            recordId: createdRecord.id,
            displayName: getRecordDisplayName(
              createdRecord,
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
          message: `Failed to create record in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to create record: ${error}`);

      return {
        success: false,
        message: `Failed to create record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to create record',
      };
    }
  }
}
