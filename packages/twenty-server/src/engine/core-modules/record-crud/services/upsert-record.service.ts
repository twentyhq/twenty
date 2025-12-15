import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { UpsertRecordParams } from 'src/engine/core-modules/record-crud/types/upsert-record-params.type';
import { getSelectedColumnsFromRestrictedFields } from 'src/engine/core-modules/record-crud/utils/get-selected-columns-from-restricted-fields.util';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class UpsertRecordService {
  private readonly logger = new Logger(UpsertRecordService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async execute(params: UpsertRecordParams): Promise<ToolOutput> {
    const { objectName, objectRecord, workspaceId, rolePermissionConfig } =
      params;

    if (!workspaceId) {
      return {
        success: false,
        message: 'Failed to upsert record: Workspace ID is required',
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

          const fieldsToUpdateArray = Object.keys(objectRecord).filter(
            (field) => isDefined(objectRecord[field]),
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

          const { fieldIdByName, fieldIdByJoinColumnName } =
            buildFieldMapsFromFlatObjectMetadata(
              flatFieldMetadataMaps,
              flatObjectMetadata,
            );

          const uniqueFieldsToUpdate = fieldsToUpdateArray
            .map(
              (fieldName) =>
                fieldIdByName[fieldName] || fieldIdByJoinColumnName[fieldName],
            )
            .map((fieldId) => flatFieldMetadataMaps.byId[fieldId])
            .filter(isDefined)
            .filter((field) => field.isUnique || field.name === 'id');

          const conflictPathsUniqueFieldsToUpdate =
            uniqueFieldsToUpdate.flatMap((field) => {
              if (isCompositeFieldMetadataType(field.type)) {
                const compositeType = getCompositeTypeOrThrow(field.type);

                const uniqueProperties = compositeType.properties.filter(
                  (prop) => prop.isIncludedInUniqueConstraint,
                );

                const propertiesToUse =
                  uniqueProperties.length > 0
                    ? uniqueProperties
                    : [compositeType.properties[0]];

                return propertiesToUse.map((prop) =>
                  computeCompositeColumnName(field, prop),
                );
              }

              return [field.name];
            });

          const conflictPaths =
            conflictPathsUniqueFieldsToUpdate.length > 0
              ? conflictPathsUniqueFieldsToUpdate
              : ['id'];

          const restrictedFields =
            repository.objectRecordsPermissions?.[flatObjectMetadata.id]
              ?.restrictedFields;

          const selectedColumns = getSelectedColumnsFromRestrictedFields(
            restrictedFields,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          );

          const upsertResult = await repository.upsert(
            transformedObjectRecord,
            {
              conflictPaths: conflictPaths,
            },
            undefined,
            selectedColumns,
          );

          const upsertedRecordId = upsertResult.identifiers?.[0].id;

          if (!isDefined(upsertedRecordId)) {
            throw new RecordCrudException(
              `Failed to upsert record in ${objectName}`,
              RecordCrudExceptionCode.RECORD_UPSERT_FAILED,
            );
          }

          const upsertedRecord = await repository.findOne({
            where: {
              id: upsertedRecordId,
            },
            select: selectedColumns,
          });

          if (!upsertedRecord) {
            throw new RecordCrudException(
              `Record not found after upsert with id ${upsertedRecordId} in ${objectName}`,
              RecordCrudExceptionCode.RECORD_UPSERT_FAILED,
            );
          }

          this.logger.log(`Record upserted successfully in ${objectName}`);

          return {
            success: true,
            message: `Record upserted successfully in ${objectName}`,
            result: upsertedRecord,
          };
        },
      );
    } catch (error) {
      if (error instanceof RecordCrudException) {
        return {
          success: false,
          message: `Failed to upsert record in ${objectName}`,
          error: error.message,
        };
      }

      this.logger.error(`Failed to upsert record: ${error}`);

      return {
        success: false,
        message: `Failed to upsert record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to upsert record',
      };
    }
  }
}
