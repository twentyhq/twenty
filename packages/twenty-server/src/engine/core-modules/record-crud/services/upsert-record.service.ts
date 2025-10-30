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
import { computeUniqueIndexWhereClause } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-index-where-clause.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UpsertRecordService {
  private readonly logger = new Logger(UpsertRecordService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
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

    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          rolePermissionConfig,
        );

      const fieldsToUpdateArray = Object.keys(objectRecord).filter((field) =>
        isDefined(objectRecord[field]),
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

      const uniqueFieldsToUpdate = fieldsToUpdateArray
        .map((field) => objectMetadataItemWithFieldsMaps.fieldIdByName[field])
        .map((fieldId) => objectMetadataItemWithFieldsMaps.fieldsById[fieldId])
        .filter((field) => field.isUnique || field.name === 'id');

      const conflictPathsUniqueFieldsToUpdate = uniqueFieldsToUpdate.flatMap(
        (field) => {
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
        },
      );

      const conflictPaths =
        conflictPathsUniqueFieldsToUpdate.length > 0
          ? conflictPathsUniqueFieldsToUpdate
          : ['id'];

      const indexPredicate = uniqueFieldsToUpdate
        .map((field) =>
          computeUniqueIndexWhereClause({
            type: field.type,
            name: field.name,
          }),
        )
        .filter(isDefined);

      const restrictedFields =
        repository.objectRecordsPermissions?.[
          objectMetadataItemWithFieldsMaps.id
        ]?.restrictedFields;

      const selectedColumns = getSelectedColumnsFromRestrictedFields(
        restrictedFields,
        objectMetadataItemWithFieldsMaps,
      );

      const upsertResult = await repository.upsert(
        transformedObjectRecord,
        {
          conflictPaths: conflictPaths,
          indexPredicate:
            indexPredicate.length > 0
              ? `${indexPredicate.join(' AND ')}`
              : undefined,
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
