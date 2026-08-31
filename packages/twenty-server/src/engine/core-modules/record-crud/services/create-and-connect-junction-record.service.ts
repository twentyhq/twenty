import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CreateAndConnectJunctionRecordInput } from 'src/engine/core-modules/record-crud/dtos/create-and-connect-junction-record.input';
import { type CreateAndConnectJunctionRecordResultDto } from 'src/engine/core-modules/record-crud/dtos/create-and-connect-junction-record-result.dto';
import { RecordCrudExceptionCode } from 'src/engine/core-modules/record-crud/exceptions/record-crud-exception-code.enum';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { getRecordCrudExceptionUserFriendlyMessage } from 'src/engine/core-modules/record-crud/utils/get-record-crud-exception-user-friendly-message.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveJunctionRelationTargetShapeFromVisibleField } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-junction-relation-target-shape-from-visible-field.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class CreateAndConnectJunctionRecordService {
  constructor(
    private readonly commonCreateOneQueryRunnerService: CommonCreateOneQueryRunnerService,
    private readonly commonApiContextBuilderService: CommonApiContextBuilderService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async execute({
    input,
    authContext,
  }: {
    input: CreateAndConnectJunctionRecordInput;
    authContext: WorkspaceAuthContext;
  }): Promise<CreateAndConnectJunctionRecordResultDto> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceContext = getWorkspaceContext();
      const relationFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: input.relationFieldMetadataId,
        flatEntityMaps: workspaceContext.flatFieldMetadataMaps,
      });

      if (!isDefined(relationFlatFieldMetadata)) {
        throw new CommonQueryRunnerException(
          'Relation field metadata not found',
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          {
            userFriendlyMessage: getRecordCrudExceptionUserFriendlyMessage(
              RecordCrudExceptionCode.INVALID_REQUEST,
            ),
          },
        );
      }

      const junctionShape = resolveJunctionRelationTargetShapeFromVisibleField({
        relationFlatFieldMetadata,
        flatObjectMetadataMaps: workspaceContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: workspaceContext.flatFieldMetadataMaps,
      });

      if (
        !isDefined(junctionShape) ||
        junctionShape.isTargetMorphRelation ||
        junctionShape.targetJoinColumns.length !== 1
      ) {
        throw new CommonQueryRunnerException(
          'Create and connect only supports regular junction relations',
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          {
            userFriendlyMessage: getRecordCrudExceptionUserFriendlyMessage(
              RecordCrudExceptionCode.INVALID_REQUEST,
            ),
          },
        );
      }

      const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFlatFieldMetadata.objectMetadataId,
        flatEntityMaps: workspaceContext.flatObjectMetadataMaps,
      });
      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: junctionShape.targetJoinColumns[0].targetObjectMetadataId,
        flatEntityMaps: workspaceContext.flatObjectMetadataMaps,
      });

      if (
        !isDefined(sourceFlatObjectMetadata) ||
        !isDefined(targetFlatObjectMetadata)
      ) {
        throw new CommonQueryRunnerException(
          'Junction relation object metadata is incomplete',
          CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext: workspaceContext.authContext,
        userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
        apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      });

      if (!isDefined(rolePermissionConfig)) {
        throw new CommonQueryRunnerException(
          'Invalid auth context',
          CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const [targetApiContext, junctionApiContext] = await Promise.all([
        this.commonApiContextBuilderService.build({
          authContext,
          objectName: targetFlatObjectMetadata.nameSingular,
          rolePermissionConfig,
        }),
        this.commonApiContextBuilderService.build({
          authContext,
          objectName: junctionShape.junctionObjectNameSingular,
          rolePermissionConfig,
        }),
      ]);

      return this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const sourceRecordExists = await transactionScope
            .getRepository(
              sourceFlatObjectMetadata.nameSingular,
              rolePermissionConfig,
            )
            .existsBy({ id: input.sourceRecordId });

          if (!sourceRecordExists) {
            throw new CommonQueryRunnerException(
              'Source record not found',
              CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
              {
                userFriendlyMessage: getRecordCrudExceptionUserFriendlyMessage(
                  RecordCrudExceptionCode.RECORD_NOT_FOUND,
                ),
              },
            );
          }

          const { results: targetRecord } =
            await this.commonCreateOneQueryRunnerService.execute(
              {
                data: input.targetRecordInput,
                selectedFields: targetApiContext.selectedFields,
              },
              {
                ...targetApiContext.queryRunnerContext,
                transactionScope,
              },
            );

          const { results: junctionRecord } =
            await this.commonCreateOneQueryRunnerService.execute(
              {
                data: {
                  [junctionShape.junctionSourceJoinColumnName]:
                    input.sourceRecordId,
                  [junctionShape.targetJoinColumns[0].joinColumnName]:
                    targetRecord.id,
                },
                selectedFields: junctionApiContext.selectedFields,
              },
              {
                ...junctionApiContext.queryRunnerContext,
                transactionScope,
              },
            );

          return {
            targetRecord: targetRecord as ObjectRecord,
            junctionRecord: junctionRecord as ObjectRecord,
          };
        },
      );
    }, authContext);
  }
}
