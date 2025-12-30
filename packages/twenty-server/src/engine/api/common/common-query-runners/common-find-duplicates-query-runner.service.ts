import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import {
  QUERY_MAX_RECORDS,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import { ObjectRecord, OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonFindDuplicatesOutputItem } from 'src/engine/api/common/types/common-find-duplicates-output-item.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindDuplicatesQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class CommonFindDuplicatesQueryRunnerService extends CommonBaseQueryRunnerService<
  FindDuplicatesQueryArgs,
  CommonFindDuplicatesOutputItem[]
> {
  protected readonly operationName = CommonQueryNames.FIND_DUPLICATES;

  async run(
    args: CommonExtendedInput<FindDuplicatesQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonFindDuplicatesOutputItem[]> {
    const {
      repository,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      commonQueryParser,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
    } = queryRunnerContext;

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (isDefined(args.ids) && args.ids.length > 0) {
      objectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(args.ids) })
        .setFindOptions({
          select: columnsToSelect,
        })
        .getMany()) as ObjectRecord[];
    } else if (args.data && !isEmpty(args.data)) {
      objectRecords = args.data;
    }

    const findDuplicatesOutput: CommonFindDuplicatesOutputItem[] =
      await Promise.all(
        objectRecords.map(async (record) => {
          const duplicateConditions = buildDuplicateConditions(
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            [record],
            record.id,
          );

          if (isEmpty(duplicateConditions)) {
            return {
              records: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            };
          }

          const duplicateRecordsQueryBuilder = repository.createQueryBuilder(
            flatObjectMetadata.nameSingular,
          );

          commonQueryParser.applyFilterToBuilder(
            duplicateRecordsQueryBuilder,
            flatObjectMetadata.nameSingular,
            duplicateConditions,
          );

          const duplicates = (await duplicateRecordsQueryBuilder
            .setFindOptions({
              select: columnsToSelect,
            })
            .take(QUERY_MAX_RECORDS)
            .getMany()) as ObjectRecord[];

          const aggregateQueryBuilder = duplicateRecordsQueryBuilder.clone();
          const totalCount = await aggregateQueryBuilder.getCount();

          const { startCursor, endCursor } = getPageInfo(
            duplicates,
            [{ id: OrderByDirection.AscNullsFirst }],
            QUERY_MAX_RECORDS,
            true,
          );

          return {
            records: duplicates,
            totalCount,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor,
            endCursor,
          };
        }),
      );

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: findDuplicatesOutput.flatMap(
          (item) => item.records,
        ),
        parentObjectRecordsAggregatedValues: {},
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

    return findDuplicatesOutput;
  }

  async computeArgs(
    args: CommonInput<FindDuplicatesQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindDuplicatesQueryArgs>> {
    const { authContext, flatObjectMetadata, flatFieldMetadataMaps } =
      queryRunnerContext;

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    return {
      ...args,
      ids: await Promise.all(
        args.ids?.map((id) =>
          this.queryRunnerArgsFactory.overrideValueByFieldMetadata(
            'id',
            id,
            fieldIdByName,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          ),
        ) ?? [],
      ),
      data: await this.dataArgProcessor.process({
        partialRecordInputs: args.data,
        authContext,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldBackfillPositionIfUndefined: false,
      }),
    };
  }

  async processQueryResult(
    queryResult: CommonFindDuplicatesOutputItem[],
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    authContext: WorkspaceAuthContext,
  ): Promise<CommonFindDuplicatesOutputItem[]> {
    const processedResults = await Promise.all(
      queryResult.map(async (result) => {
        return {
          ...result,
          records: await this.commonResultGettersService.processRecordArray(
            result.records,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            authContext.workspace.id,
          ),
        };
      }),
    );

    return processedResults;
  }

  async validate(
    args: CommonInput<FindDuplicatesQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    if (!args.data && !args.ids) {
      throw new CommonQueryRunnerException(
        'You have to provide either "data" or "ids" argument',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (args.data && args.ids) {
      throw new CommonQueryRunnerException(
        'You cannot provide both "data" and "ids" arguments',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new CommonQueryRunnerException(
        'The "data" condition can not be empty when "ids" input not provided',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
