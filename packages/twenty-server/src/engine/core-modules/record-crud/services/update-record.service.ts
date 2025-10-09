import { Injectable, Logger } from '@nestjs/common';

import deepEqual from 'deep-equal';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type UpdateRecordParams } from 'src/engine/core-modules/record-crud/types/update-record-params.type';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UpdateRecordService {
  private readonly logger = new Logger(UpdateRecordService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute(params: UpdateRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
      objectRecord,
      fieldsToUpdate,
      workspaceId,
      roleId,
    } = params;

    if (!workspaceId) {
      return {
        success: false,
        message: 'Failed to update record: Workspace ID is required',
        error: 'Workspace ID not found',
      };
    }

    if (!isDefined(objectRecordId) || !isValidUuid(objectRecordId)) {
      return {
        success: false,
        message: 'Failed to update: Object record ID must be a valid UUID',
        error: 'Invalid object record ID',
      };
    }

    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          roleId ? { roleId } : { shouldBypassPermissionChecks: true },
        );

      const previousObjectRecord = await repository.findOne({
        where: {
          id: objectRecordId,
        },
      });

      if (!previousObjectRecord) {
        throw new RecordCrudException(
          `Failed to update: Record ${objectName} with id ${objectRecordId} not found`,
          RecordCrudExceptionCode.RECORD_NOT_FOUND,
        );
      }

      // If fieldsToUpdate is provided, filter the objectRecord
      const fieldsToUpdateArray = fieldsToUpdate || Object.keys(objectRecord);

      if (fieldsToUpdateArray.length === 0) {
        return {
          success: true,
          message: 'No fields to update',
          result: previousObjectRecord,
        };
      }

      const { objectMetadataItemWithFieldsMaps } =
        await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
          objectName,
          workspaceId,
        );

      if (
        !canObjectBeManagedByWorkflow({
          nameSingular: objectMetadataItemWithFieldsMaps.nameSingular,
          isSystem: objectMetadataItemWithFieldsMaps.isSystem,
        })
      ) {
        throw new RecordCrudException(
          'Failed to update: Object cannot be updated by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const objectRecordWithFilteredFields = Object.keys(objectRecord).reduce(
        (acc, key) => {
          if (fieldsToUpdateArray.includes(key)) {
            return {
              ...acc,
              [key]: objectRecord[key],
            };
          }

          return acc;
        },
        {},
      );

      const transformedObjectRecord =
        await this.recordInputTransformerService.process({
          recordInput: objectRecordWithFilteredFields,
          objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
        });

      const updatedObjectRecord = {
        ...previousObjectRecord,
        ...objectRecordWithFilteredFields,
      };

      if (!deepEqual(updatedObjectRecord, previousObjectRecord)) {
        await repository.update(objectRecordId, {
          ...transformedObjectRecord,
        });
      }

      this.logger.log(`Record updated successfully in ${objectName}`);

      return {
        success: true,
        message: `Record updated successfully in ${objectName}`,
        result: updatedObjectRecord,
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
