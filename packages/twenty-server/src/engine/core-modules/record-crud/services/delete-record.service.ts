import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type DeleteRecordParams } from 'src/engine/core-modules/record-crud/types/delete-record-params.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class DeleteRecordService {
  private readonly logger = new Logger(DeleteRecordService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute(params: DeleteRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
      workspaceId,
      roleId,
      soft = true,
    } = params;

    if (!workspaceId) {
      return {
        success: false,
        message: 'Failed to delete record: Workspace ID is required',
        error: 'Workspace ID not found',
      };
    }

    if (!isDefined(objectRecordId) || !isValidUuid(objectRecordId)) {
      return {
        success: false,
        message: 'Failed to delete: Object record ID must be a valid UUID',
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
          'Failed to delete: Object cannot be deleted by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const objectRecord = await repository.findOne({
        where: {
          id: objectRecordId,
        },
      });

      if (!objectRecord) {
        throw new RecordCrudException(
          `Failed to delete: Record ${objectName} with id ${objectRecordId} not found`,
          RecordCrudExceptionCode.RECORD_NOT_FOUND,
        );
      }

      if (soft) {
        const columnsToReturnForSoftDelete: string[] = [];

        await repository.softDelete(
          objectRecordId,
          undefined,
          columnsToReturnForSoftDelete,
        );

        this.logger.log(`Record soft deleted successfully from ${objectName}`);

        return {
          success: true,
          message: `Record soft deleted successfully from ${objectName}`,
          result: objectRecord,
        };
      } else {
        await repository.remove(objectRecord);

        this.logger.log(
          `Record permanently deleted successfully from ${objectName}`,
        );

        return {
          success: true,
          message: `Record permanently deleted successfully from ${objectName}`,
          result: { id: objectRecordId },
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
