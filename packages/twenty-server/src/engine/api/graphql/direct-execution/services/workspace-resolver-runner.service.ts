import { Injectable } from '@nestjs/common';

import { OrderByDirection } from 'twenty-shared/types';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { CommonRestoreOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-one-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import {
  buildConnectionSelectedFields,
  buildRecordSelectedFields,
} from 'src/engine/api/graphql/direct-execution/utils/build-common-selected-fields.util';
import { assertCreateManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-create-many-args.util';
import { assertCreateOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-create-one-args.util';
import { assertDeleteManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-delete-many-args.util';
import { assertDeleteOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-delete-one-args.util';
import { assertDestroyManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-destroy-many-args.util';
import { assertDestroyOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-destroy-one-args.util';
import { assertFindDuplicatesArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-duplicates-args.util';
import { assertFindManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-many-args.util';
import { assertFindOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-one-args.util';
import { assertGroupByArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-group-by-args.util';
import { assertMergeManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-merge-many-args.util';
import { assertRestoreManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-restore-many-args.util';
import { assertRestoreOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-restore-one-args.util';
import { assertUpdateManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-update-many-args.util';
import { assertUpdateOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-update-one-args.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type GraphqlResolverResult } from 'src/engine/api/graphql/direct-execution/types/graphql-resolver-result.type';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { createQueryRunnerContext } from 'src/engine/api/graphql/workspace-resolver-builder/utils/create-query-runner-context.util';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

const CONNECTION_RESOLVER_METHOD_NAMES = new Set<string>([
  RESOLVER_METHOD_NAMES.FIND_MANY,
  RESOLVER_METHOD_NAMES.FIND_DUPLICATES,
  RESOLVER_METHOD_NAMES.GROUP_BY,
]);

@Injectable()
export class WorkspaceResolverRunnerService {
  constructor(
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly commonFindOneQueryRunnerService: CommonFindOneQueryRunnerService,
    private readonly commonFindDuplicatesQueryRunnerService: CommonFindDuplicatesQueryRunnerService,
    private readonly commonGroupByQueryRunnerService: CommonGroupByQueryRunnerService,
    private readonly commonCreateOneQueryRunnerService: CommonCreateOneQueryRunnerService,
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
    private readonly commonUpdateOneQueryRunnerService: CommonUpdateOneQueryRunnerService,
    private readonly commonUpdateManyQueryRunnerService: CommonUpdateManyQueryRunnerService,
    private readonly commonDeleteOneQueryRunnerService: CommonDeleteOneQueryRunnerService,
    private readonly commonDeleteManyQueryRunnerService: CommonDeleteManyQueryRunnerService,
    private readonly commonDestroyOneQueryRunnerService: CommonDestroyOneQueryRunnerService,
    private readonly commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
    private readonly commonRestoreOneQueryRunnerService: CommonRestoreOneQueryRunnerService,
    private readonly commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
    private readonly commonMergeManyQueryRunnerService: CommonMergeManyQueryRunnerService,
  ) {}

  async run({
    method,
    args,
    fieldSelections,
    workspaceSchemaBuilderContext,
  }: {
    method: WorkspaceResolverBuilderMethodNames;
    args: unknown;
    fieldSelections: GraphqlFieldSelection[];
    workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext;
  }): Promise<GraphqlResolverResult> {
    const queryRunnerContext = createQueryRunnerContext({
      workspaceSchemaBuilderContext,
    });
    const buildSelectedFields = CONNECTION_RESOLVER_METHOD_NAMES.has(method)
      ? buildConnectionSelectedFields
      : buildRecordSelectedFields;
    const selectedFields = buildSelectedFields({
      fieldSelections,
      flatObjectMetadata: workspaceSchemaBuilderContext.flatObjectMetadata,
      flatObjectMetadataMaps:
        workspaceSchemaBuilderContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps:
        workspaceSchemaBuilderContext.flatFieldMetadataMaps,
    });

    switch (method) {
      case RESOLVER_METHOD_NAMES.FIND_MANY: {
        assertFindManyArgs(args);

        const { results, args: processedArgs } =
          await this.commonFindManyQueryRunnerService.execute(
            { ...args, selectedFields },
            queryRunnerContext,
          );

        return {
          kind: 'connection',
          connection: {
            records: results.records,
            connectionValues: {
              ...results.aggregatedValues,
              totalCount: results.totalCount,
            },
            relationAggregatedValues: results.relationAggregatedValues,
            hasNextPage: results.pageInfo.hasNextPage,
            hasPreviousPage: results.pageInfo.hasPreviousPage,
            order: processedArgs.orderBy,
            orderByValuesByRecordId: results.orderByValuesByRecordId,
          },
        };
      }
      case RESOLVER_METHOD_NAMES.FIND_DUPLICATES: {
        assertFindDuplicatesArgs(args);

        const { results } =
          await this.commonFindDuplicatesQueryRunnerService.execute(
            { ...args, selectedFields },
            queryRunnerContext,
          );

        return {
          kind: 'connections',
          connections: results.map((duplicates) => ({
            records: duplicates.records,
            connectionValues: { totalCount: duplicates.totalCount },
            hasNextPage: duplicates.hasNextPage,
            hasPreviousPage: duplicates.hasPreviousPage,
            order: [{ id: OrderByDirection.AscNullsFirst }],
          })),
        };
      }
      case RESOLVER_METHOD_NAMES.GROUP_BY: {
        assertGroupByArgs(args);

        const { results } = await this.commonGroupByQueryRunnerService.execute(
          {
            ...args,
            selectedFields,
            includeRecords:
              Object.keys(selectedFields.fields).length > 0 ||
              Object.keys(selectedFields.relations).length > 0,
          },
          queryRunnerContext,
        );

        return {
          kind: 'groupByConnections',
          connections: results.map(({ records, ...groupValues }) => ({
            records: records ?? [],
            connectionValues: {
              ...groupValues,
              totalCount: Number(groupValues.totalCount ?? 0),
            },
            hasNextPage: false,
            hasPreviousPage: false,
            order: args.orderByForRecords ?? [],
          })),
        };
      }
      case RESOLVER_METHOD_NAMES.FIND_ONE:
        assertFindOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonFindOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.CREATE_ONE:
        assertCreateOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonCreateOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.UPDATE_ONE:
        assertUpdateOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonUpdateOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.DELETE_ONE:
        assertDeleteOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonDeleteOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.DESTROY_ONE:
        assertDestroyOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonDestroyOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.RESTORE_ONE:
        assertRestoreOneArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonRestoreOneQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.MERGE_MANY:
        assertMergeManyArgs(args);

        return {
          kind: 'record',
          record: (
            await this.commonMergeManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.CREATE_MANY:
        assertCreateManyArgs(args);

        return {
          kind: 'records',
          records: (
            await this.commonCreateManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.UPDATE_MANY:
        assertUpdateManyArgs(args);

        return {
          kind: 'records',
          records: (
            await this.commonUpdateManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.DELETE_MANY:
        assertDeleteManyArgs(args);

        return {
          kind: 'records',
          records: (
            await this.commonDeleteManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.DESTROY_MANY:
        assertDestroyManyArgs(args);

        return {
          kind: 'records',
          records: (
            await this.commonDestroyManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      case RESOLVER_METHOD_NAMES.RESTORE_MANY:
        assertRestoreManyArgs(args);

        return {
          kind: 'records',
          records: (
            await this.commonRestoreManyQueryRunnerService.execute(
              { ...args, selectedFields },
              queryRunnerContext,
            )
          ).results,
        };
      default:
        throw new GraphqlDirectExecutionException(
          `Unknown method: ${method}`,
          GraphqlDirectExecutionExceptionCode.UNKNOWN_METHOD,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
    }
  }
}
