import { Injectable, Logger } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type CreateRecordParams } from 'src/engine/core-modules/record-crud/types/create-record-params.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getSelectedColumnsFromRestrictedFields } from 'src/engine/core-modules/record-crud/utils/get-selected-columns-from-restricted-fields.util';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class CreateRecordService {
  private readonly logger = new Logger(CreateRecordService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async execute(params: CreateRecordParams): Promise<ToolOutput> {
    const { objectName, objectRecord, workspaceId, rolePermissionConfig } =
      params;

    if (!workspaceId) {
      return {
        success: false,
        message: 'Failed to create record: Workspace ID is required',
        error: 'Workspace ID not found',
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

          const position = await this.recordPositionService.buildRecordPosition(
            {
              value: 'first',
              objectMetadata: flatObjectMetadata,
              workspaceId,
            },
          );

          const { fieldIdByName, fieldIdByJoinColumnName } =
            buildFieldMapsFromFlatObjectMetadata(
              flatFieldMetadataMaps,
              flatObjectMetadata,
            );

          const validObjectRecord = Object.fromEntries(
            Object.entries(objectRecord).filter(
              ([key]) =>
                isDefined(fieldIdByName[key]) ||
                isDefined(fieldIdByJoinColumnName[key]),
            ),
          );

          const transformedObjectRecord =
            await this.recordInputTransformerService.process({
              recordInput: validObjectRecord,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            });

          const restrictedFields =
            repository.objectRecordsPermissions?.[flatObjectMetadata.id]
              ?.restrictedFields;

          const selectedColumns = getSelectedColumnsFromRestrictedFields(
            restrictedFields,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          );

          const insertResult = await repository.insert(
            {
              ...transformedObjectRecord,
              position,
              createdBy: params.createdBy ?? {
                source: FieldActorSource.WORKFLOW,
                name: 'Workflow',
              },
            },
            undefined,
            selectedColumns,
          );

          const [createdRecord] = insertResult.generatedMaps;

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
                  { ...transformedObjectRecord, ...createdRecord },
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
