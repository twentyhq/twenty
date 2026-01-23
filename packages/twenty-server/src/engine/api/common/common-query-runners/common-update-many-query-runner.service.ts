import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { FilesFieldSyncService } from 'src/engine/api/common/common-args-processors/data-arg-processor/services/files-field-sync.service';
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
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class CommonUpdateManyQueryRunnerService extends CommonBaseQueryRunnerService<
  UpdateManyQueryArgs,
  ObjectRecord[]
> {
  constructor(private readonly filesFieldSyncService: FilesFieldSyncService) {
    super();
  }

  protected readonly operationName = CommonQueryNames.UPDATE_MANY;

  async run(
    args: CommonExtendedInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    const originalData = structuredClone(args.data);

    const {
      repository,
      authContext,
      rolePermissionConfig,
      workspaceDataSource,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      commonQueryParser,
    } = queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      flatObjectMetadata.nameSingular,
      args.filter,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (
      this.filesFieldSyncService.hasFilesFieldToUpdate(
        args.data,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      )
    ) {
      const restrictedFields =
        repository.objectRecordsPermissions?.[flatObjectMetadata.id]
          ?.restrictedFields;

      const selectOptions = getAllSelectableColumnNames({
        restrictedFields: restrictedFields ?? {},
        objectMetadata: {
          objectMetadataMapItem: flatObjectMetadata,
          flatFieldMetadataMaps,
        },
      });

      const existingRecords = (await queryBuilder
        .clone()
        .setFindOptions({ select: selectOptions })
        .getMany()) as (ObjectRecord & { id: string })[];

      if (existingRecords.length > 1) {
        throw new CommonQueryRunnerException(
          'File can be associated with only one record',
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          {
            userFriendlyMessage: msg`File can be associated with only one record`,
          },
        );
      }

      if (existingRecords.length === 1) {
        this.filesFieldSyncService.prepareFilesFieldsBeforeUpdateOne({
          data: args.data,
          existingRecord: existingRecords[0],
          flatObjectMetadata,
          flatFieldMetadataMaps,
        });
      }
    }

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(args.data)
      .returning(columnsToReturn)
      .execute();

    const updatedRecords = updatedObjectRecords.generatedMaps as ObjectRecord[];

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
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    await this.processFilesFieldSyncOperationsIfNeeded({
      originalData,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspace: authContext.workspace,
    });

    return updatedRecords;
  }

  async computeArgs(
    args: CommonInput<UpdateManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<UpdateManyQueryArgs>> {
    const { authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      queryRunnerContext;

    return {
      ...args,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        args.filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      ),
      data: (
        await this.dataArgProcessor.process({
          partialRecordInputs: [args.data],
          authContext,
          flatObjectMetadata,
          flatFieldMetadataMaps,
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
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
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

  private async processFilesFieldSyncOperationsIfNeeded({
    originalData,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    workspace,
  }: {
    originalData: Partial<ObjectRecord>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspace: WorkspaceEntity;
  }): Promise<void> {
    await this.filesFieldSyncService.syncFileEntities({
      data: [originalData],
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceId: workspace.id,
      workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
    });
  }
}
