import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type DeleteRecordParams } from 'src/engine/core-modules/record-crud/types/delete-record-params.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class DeleteRecordService {
  private readonly logger = new Logger(DeleteRecordService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(params: DeleteRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
      workspaceId,
      rolePermissionConfig,
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

    const authContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            objectName,
            rolePermissionConfig,
          );

          const { flatObjectMetadataMaps, objectIdByNameSingular } =
            repository.internalContext;

          const objectId = objectIdByNameSingular[objectName];

          if (!isDefined(objectId)) {
            throw new RecordCrudException(
              `Object ${objectName} not found`,
              RecordCrudExceptionCode.INVALID_REQUEST,
            );
          }

          const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityMaps: flatObjectMetadataMaps,
            flatEntityId: objectId,
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

            this.logger.log(
              `Record soft deleted successfully from ${objectName}`,
            );

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
        },
      );
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
