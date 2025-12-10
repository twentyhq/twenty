import { Injectable, Logger } from '@nestjs/common';

import deepEqual from 'deep-equal';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type UpdateRecordParams } from 'src/engine/core-modules/record-crud/types/update-record-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getSelectedColumnsFromRestrictedFields } from 'src/engine/core-modules/record-crud/utils/get-selected-columns-from-restricted-fields.util';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class UpdateRecordService {
  private readonly logger = new Logger(UpdateRecordService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async execute(params: UpdateRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
      objectRecord,
      fieldsToUpdate,
      workspaceId,
      rolePermissionConfig,
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

          const {
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          } = repository.internalContext;

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

          const restrictedFields =
            repository.objectRecordsPermissions?.[flatObjectMetadata.id]
              ?.restrictedFields;

          const selectedColumns = getSelectedColumnsFromRestrictedFields(
            restrictedFields,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          );

          const previousObjectRecord = await repository.findOne({
            where: {
              id: objectRecordId,
            },
            select: selectedColumns,
          });

          if (!previousObjectRecord) {
            throw new RecordCrudException(
              `Failed to update: Record ${objectName} with id ${objectRecordId} not found`,
              RecordCrudExceptionCode.RECORD_NOT_FOUND,
            );
          }

          const fieldsToUpdateArray =
            fieldsToUpdate || Object.keys(objectRecord);

          if (fieldsToUpdateArray.length === 0) {
            return {
              success: true,
              message: 'No fields to update',
              result: previousObjectRecord,
            };
          }

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

          const objectRecordWithFilteredFields = Object.keys(
            objectRecord,
          ).reduce((acc, key) => {
            if (fieldsToUpdateArray.includes(key)) {
              return {
                ...acc,
                [key]: objectRecord[key],
              };
            }

            return acc;
          }, {});

          const transformedObjectRecord =
            await this.recordInputTransformerService.process({
              recordInput: objectRecordWithFilteredFields,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            });

          const updatedObjectRecord = {
            ...previousObjectRecord,
            ...objectRecordWithFilteredFields,
          };

          if (!deepEqual(updatedObjectRecord, previousObjectRecord)) {
            await repository.update(
              objectRecordId,
              {
                ...transformedObjectRecord,
              },
              undefined,
              selectedColumns,
            );
          }

          this.logger.log(`Record updated successfully in ${objectName}`);

          return {
            success: true,
            message: `Record updated successfully in ${objectName}`,
            result: updatedObjectRecord,
            recordReferences: [
              {
                objectNameSingular: objectName,
                recordId: objectRecordId,
                displayName: getRecordDisplayName(
                  updatedObjectRecord,
                  flatObjectMetadata,
                  flatFieldMetadataMaps,
                ),
              },
            ],
          };
        },
      );
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
