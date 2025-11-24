import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { canObjectBeManagedByWorkflow } from 'twenty-shared/workflow';
import { FieldActorSource } from 'twenty-shared/types';

import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { type CreateRecordParams } from 'src/engine/core-modules/record-crud/types/create-record-params.type';
import { getSelectedColumnsFromRestrictedFields } from 'src/engine/core-modules/record-crud/utils/get-selected-columns-from-restricted-fields.util';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class CreateRecordService {
  private readonly logger = new Logger(CreateRecordService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
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

    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          rolePermissionConfig,
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
          'Failed to create: Object cannot be created by workflow',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: objectMetadataItemWithFieldsMaps,
        workspaceId,
      });

      const validObjectRecord = Object.fromEntries(
        Object.entries(objectRecord).filter(
          ([key]) =>
            isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]) ||
            isDefined(
              objectMetadataItemWithFieldsMaps.fieldIdByJoinColumnName[key],
            ),
        ),
      );

      const transformedObjectRecord =
        await this.recordInputTransformerService.process({
          recordInput: validObjectRecord,
          objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
        });

      const restrictedFields =
        repository.objectRecordsPermissions?.[
          objectMetadataItemWithFieldsMaps.id
        ]?.restrictedFields;

      const selectedColumns = getSelectedColumnsFromRestrictedFields(
        restrictedFields,
        objectMetadataItemWithFieldsMaps,
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
