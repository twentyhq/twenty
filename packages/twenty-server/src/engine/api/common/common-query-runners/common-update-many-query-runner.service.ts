import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectRecord,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  UpdateManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import {
  findOwnerField,
  type OwnerField,
} from 'src/engine/record-share/utils/find-owner-field.util';

@Injectable()
export class CommonUpdateManyQueryRunnerService extends CommonBaseQueryRunnerService<
  UpdateManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.UPDATE_MANY;

  constructor(private readonly recordShareService: RecordShareService) {
    super();
  }

  async run(
    args: CommonExtendedInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    const updatedOwnerField = this.findUpdatedOwnerField(
      args,
      queryRunnerContext,
    );

    if (
      isDefined(updatedOwnerField) &&
      !isDefined(queryRunnerContext.transactionScope)
    ) {
      return this.workspaceOrmManager.runInWorkspaceTransaction(
        (transactionScope) =>
          this.run(args, {
            ...queryRunnerContext,
            transactionScope,
            repository: transactionScope.getRepository(
              queryRunnerContext.flatObjectMetadata.nameSingular,
              queryRunnerContext.rolePermissionConfig,
            ),
          }),
      );
    }

    const {
      authContext,
      rolePermissionConfig,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      transactionScope,
    } = queryRunnerContext;

    const selectedColumns = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const updatedRecords = await this.runFilteredMutation({
      queryRunnerContext,
      filter: args.filter,
      columnsToReturn: isDefined(updatedOwnerField)
        ? [...new Set([...selectedColumns, updatedOwnerField.joinColumnName])]
        : selectedColumns,
      kind: 'update',
      data: args.data,
      recordShareAccessLevels: isDefined(updatedOwnerField)
        ? [RecordShareAccessLevel.FULL]
        : undefined,
    });

    if (isDefined(updatedOwnerField)) {
      const ownerWorkspaceMemberIdByRecordId = Object.fromEntries(
        updatedRecords.flatMap((record) => {
          const ownerWorkspaceMemberId =
            record[updatedOwnerField.joinColumnName];

          return isDefined(ownerWorkspaceMemberId)
            ? [[record.id, ownerWorkspaceMemberId]]
            : [];
        }),
      );

      await this.recordShareService.replaceOwnerRows({
        workspaceId: authContext.workspace.id,
        objectMetadataId: flatObjectMetadata.id,
        ownerWorkspaceMemberIdByRecordId,
        transactionScope,
      });
    }

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: updatedRecords,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
        ...this.getNestedRelationsReadPathOptions(),
      });
    }

    return updatedRecords;
  }

  private findUpdatedOwnerField(
    args: CommonExtendedInput<UpdateManyQueryArgs>,
    {
      flatObjectMetadata,
      flatFieldMetadataMaps,
      featureFlagsMap,
    }: CommonExtendedQueryRunnerContext,
  ): OwnerField | undefined {
    if (
      getEffectiveReadability(flatObjectMetadata) !==
        MetadataReadability.PRIVATE ||
      !(featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] ?? false)
    ) {
      return undefined;
    }

    const ownerField = findOwnerField({
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    return isDefined(ownerField) &&
      isDefined(args.data) &&
      (args.data[ownerField.joinColumnName] !== undefined ||
        args.data[ownerField.name] !== undefined)
      ? ownerField
      : undefined;
  }

  async computeArgs(
    args: CommonInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<UpdateManyQueryArgs>> {
    const {
      authContext,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      filter: this.filterArgProcessor.process({
        filter: args.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      data: (
        await this.dataArgProcessor.process({
          partialRecordInputs: [args.data],
          authContext,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
          shouldBackfillPositionIfUndefined: false,
        })
      )[0],
    };
  }

  async validate(
    args: CommonInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);
    if (!args.filter) {
      throw new CommonQueryRunnerException(
        'Filter is required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    args.filter.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }

  async processQueryResult(
    queryResult: ObjectRecord[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord[]> {
    return await this.commonResultGettersService.processRecordArray(
      queryResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext.workspace.id,
    );
  }
}
