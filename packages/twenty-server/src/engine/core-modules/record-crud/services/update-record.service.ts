import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type UpdateRecordParams } from 'src/engine/core-modules/record-crud/types/update-record-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { removeUndefinedFromRecord } from 'src/engine/core-modules/record-crud/utils/remove-undefined-from-record.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class UpdateRecordService {
  private readonly logger = new Logger(UpdateRecordService.name);

  constructor(
    private readonly commonUpdateOneRunner: CommonUpdateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(params: UpdateRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
      objectRecord,
      fieldsToUpdate,
      authContext,
    } = params;

    if (!isDefined(objectRecordId) || !isValidUuid(objectRecordId)) {
      return {
        success: false,
        message: 'Failed to update: Object record ID must be a valid UUID',
        error: 'Invalid object record ID',
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

      const fieldsToUpdateArray = fieldsToUpdate ?? Object.keys(objectRecord);

      if (fieldsToUpdateArray.length === 0) {
        return {
          success: true,
          message: 'No fields to update',
          result: undefined,
        };
      }

      // Filter objectRecord to only include fieldsToUpdate
      const filteredObjectRecord = Object.keys(objectRecord).reduce(
        (acc, key) => {
          if (fieldsToUpdateArray.includes(key)) {
            return { ...acc, [key]: objectRecord[key] };
          }

          return acc;
        },
        {},
      );

      // Clean undefined values from the record data (including nested composite fields)
      // This prevents validation errors for partial composite field inputs
      const cleanedRecord = removeUndefinedFromRecord(filteredObjectRecord);

      const updatedRecord = await this.commonUpdateOneRunner.execute(
        {
          id: objectRecordId,
          data: cleanedRecord,
          selectedFields,
        },
        queryRunnerContext,
      );

      this.logger.log(`Record updated successfully in ${objectName}`);

      return {
        success: true,
        message: `Record updated successfully in ${objectName}`,
        result: updatedRecord,
        recordReferences: [
          {
            objectNameSingular: objectName,
            recordId: objectRecordId,
            displayName: getRecordDisplayName(
              updatedRecord,
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
          message: `Failed to update record in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to update record: ${error}`);

      return {
        success: false,
        message: `Failed to update record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to update record',
      };
    }
  }
}
