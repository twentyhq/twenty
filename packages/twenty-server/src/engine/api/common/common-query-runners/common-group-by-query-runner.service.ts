import { Injectable } from '@nestjs/common';

import {
  CompositeFieldSubFieldName,
  PartialFieldMetadataItemOption,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  combineFilters,
  computeRecordGqlOperationFilter,
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';
import { ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { getGroupByDefinitions } from 'src/engine/api/common/common-query-runners/utils/get-group-by-definitions.util';
import { getObjectAlias } from 'src/engine/api/common/common-query-runners/utils/get-object-alias-for-group-by.util';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  GroupByQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.type';
import { GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { isGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-relation-field.util';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { GroupByWithRecordsService } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.service';
import { getGroupLimit } from 'src/engine/api/graphql/graphql-query-runner/group-by/utils/get-group-limit.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { formatColumnNameForRelationField } from 'src/engine/twenty-orm/utils/format-column-name-for-relation-field.util';

@Injectable()
export class CommonGroupByQueryRunnerService extends CommonBaseQueryRunnerService<
  GroupByQueryArgs,
  CommonGroupByOutputItem[]
> {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewService: ViewService,
    private readonly groupByWithRecordsService: GroupByWithRecordsService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.GROUP_BY;
  protected readonly isReadOnly = true;

  async run(
    args: CommonExtendedInput<GroupByQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonGroupByOutputItem[]> {
    const {
      repository,
      commonQueryParser,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext,
    } = queryRunnerContext;

    const objectMetadataNameSingular = flatObjectMetadata.nameSingular;

    let queryBuilder = repository.createQueryBuilder(
      objectMetadataNameSingular,
    );

    const groupByFields = parseGroupByArgs(
      args,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    const objectAlias = getObjectAlias(flatObjectMetadata);

    this.addJoinForGroupByOnRelationFields({
      queryBuilder,
      groupByFields,
      objectAlias,
    });

    let appliedFilters = args.filter ?? ({} as ObjectRecordFilter);

    await this.addFiltersToQueryBuilder({
      args,
      appliedFilters,
      queryBuilder,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceId: authContext.workspace.id,
      commonQueryParser,
    });

    const queryBuilderWithFiltersAndWithoutGroupBy = queryBuilder.clone();

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: args.selectedFieldsResult.aggregate,
      queryBuilder,
      objectMetadataNameSingular,
    });

    const groupByDefinitions = getGroupByDefinitions({
      groupByFields,
      objectMetadataNameSingular,
    });

    groupByDefinitions.forEach((groupByColumn, index) => {
      queryBuilder.addSelect(groupByColumn.expression, groupByColumn.alias);

      if (index === 0) {
        queryBuilder.groupBy(groupByColumn.expression);
      } else {
        queryBuilder.addGroupBy(groupByColumn.expression);
      }
    });

    commonQueryParser.applyGroupByOrderToBuilder(
      queryBuilder,
      args.orderBy ?? [],
      groupByFields,
    );

    const shouldIncludeRecords = args.includeRecords ?? false;

    if (shouldIncludeRecords) {
      return this.groupByWithRecordsService.resolveWithRecords({
        queryBuilderWithFiltersAndWithoutGroupBy,
        queryBuilderWithGroupBy: queryBuilder,
        groupByDefinitions,
        selectedFieldsResult: args.selectedFieldsResult,
        queryRunnerContext,
        orderByForRecords: args.orderByForRecords ?? [],
        groupLimit: args.limit,
        offsetForRecords: args.offsetForRecords,
      });
    }

    return this.resolveWithoutRecords({
      queryBuilder,
      groupByDefinitions,
      selectedFieldsResult: args.selectedFieldsResult,
      groupLimit: args.limit,
    });
  }

  async processQueryResult(
    queryResult: CommonGroupByOutputItem[],
    _flatObjectMetadata: FlatObjectMetadata,
    _flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    _flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    _authContext: WorkspaceAuthContext,
  ): Promise<CommonGroupByOutputItem[]> {
    return queryResult;
  }

  private async addFiltersFromView({
    args,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    appliedFilters,
    workspaceId,
  }: {
    args: GroupByQueryArgs;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    appliedFilters: ObjectRecordFilter;
    workspaceId: string;
  }): Promise<ObjectRecordFilter> {
    assertIsDefinedOrThrow(args.viewId);

    const viewFilters = await this.viewFilterService.findByViewId(
      workspaceId,
      args.viewId,
    );

    const viewFilterGroups = await this.viewFilterGroupService.findByViewId(
      workspaceId,
      args.viewId,
    );

    const recordFilters = viewFilters.map((viewFilter) => {
      const fieldMetadata =
        flatFieldMetadataMaps.byId[viewFilter.fieldMetadataId];

      if (!fieldMetadata) {
        throw new CommonQueryRunnerException(
          `Field metadata not found for field ${viewFilter.fieldMetadataId}`,
          CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: convertViewFilterValueToString(viewFilter.value),
        type: getFilterTypeFromFieldType(fieldMetadata.type),
        operand: viewFilter.operand,
        recordFilterGroupId: viewFilter.viewFilterGroupId,
        positionInRecordFilterGroup: viewFilter.positionInViewFilterGroup,
        subFieldName: viewFilter.subFieldName as CompositeFieldSubFieldName,
      };
    });

    const recordFilterGroups = viewFilterGroups.map((viewFilterGroup) => {
      return {
        id: viewFilterGroup.id,
        logicalOperator:
          viewFilterGroup.logicalOperator as unknown as RecordFilterGroupLogicalOperator, // TODO - https://github.com/twentyhq/twenty/issues/14746
        parentRecordFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
      };
    });

    const fields = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    ).map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      options: field.options as PartialFieldMetadataItemOption[],
    }));

    const filtersFromView = computeRecordGqlOperationFilter({
      recordFilters,
      recordFilterGroups: recordFilterGroups,
      fields,
      filterValueDependencies: {
        timeZone: 'UTC', // TODO: see if we use workspace member timezone here
      },
    });

    let view: ViewEntity | null = viewFilters[0]?.view;

    if (!view) {
      view = await this.viewService.findById(args.viewId, workspaceId);
    }

    const { recordGqlOperationFilter: anyFieldFilter } =
      turnAnyFieldFilterIntoRecordGqlFilter({
        fields,
        filterValue: view?.anyFieldFilterValue ?? '',
      });

    appliedFilters = combineFilters([
      appliedFilters,
      filtersFromView,
      anyFieldFilter,
    ]);

    return appliedFilters;
  }

  private async addFiltersToQueryBuilder({
    args,
    appliedFilters,
    queryBuilder,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    workspaceId,
    commonQueryParser,
  }: {
    args: GroupByQueryArgs;
    appliedFilters: ObjectRecordFilter;
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
    commonQueryParser: GraphqlQueryParser;
  }): Promise<void> {
    const objectMetadataNameSingular = flatObjectMetadata.nameSingular;

    if (args.viewId) {
      appliedFilters = await this.addFiltersFromView({
        args,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        appliedFilters,
        workspaceId,
      });
    }

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataNameSingular,
      appliedFilters,
    );

    commonQueryParser.applyDeletedAtToBuilder(queryBuilder, appliedFilters);
  }

  private async resolveWithoutRecords({
    queryBuilder,
    groupByDefinitions,
    selectedFieldsResult,
    groupLimit,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: CommonSelectedFieldsResult;
    groupLimit?: number;
  }): Promise<CommonGroupByOutputItem[]> {
    const effectiveGroupLimit = getGroupLimit(groupLimit);

    queryBuilder.limit(effectiveGroupLimit);

    const result = await queryBuilder.getRawMany();

    return formatResultWithGroupByDimensionValues({
      groupsResult: result,
      groupByDefinitions,
      aggregateFieldNames: Object.keys(selectedFieldsResult.aggregate),
    });
  }

  private addJoinForGroupByOnRelationFields({
    queryBuilder,
    groupByFields,
    objectAlias,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByFields: GroupByField[];
    objectAlias: string;
  }): void {
    const joinAliasSet = new Set<string>();

    for (const groupByField of groupByFields) {
      if (isGroupByRelationField(groupByField)) {
        const joinAlias = groupByField.fieldMetadata.name;

        if (
          !groupByField.fieldMetadata.settings ||
          !isMorphOrRelationFlatFieldMetadata(groupByField.fieldMetadata)
        ) {
          throw new CommonQueryRunnerException(
            `Field metadata settings are missing or invalid for field ${groupByField.fieldMetadata.name}`,
            CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        const joinColumnName = formatColumnNameForRelationField(
          groupByField.fieldMetadata.name,
          groupByField.fieldMetadata.settings,
        );

        if (!joinAliasSet.has(joinAlias)) {
          queryBuilder.leftJoin(
            `${objectAlias}.${joinAlias}`,
            `${joinAlias}`,
            `"${objectAlias}"."${joinColumnName}" = "${joinAlias}"."id"`,
          );
          joinAliasSet.add(joinAlias);
        }
      }
    }
  }

  async validate(
    _args: CommonInput<GroupByQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {}

  async computeArgs(
    args: CommonInput<GroupByQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<GroupByQueryArgs>> {
    const { flatObjectMetadata, flatFieldMetadataMaps } = queryRunnerContext;

    return {
      ...args,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        args.filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      ),
    };
  }

  protected override computeQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonInput<GroupByQueryArgs>,
  ): number {
    const groupByQueryComplexity = 1;
    const simpleFieldsComplexity = 1;
    const selectedFieldsComplexity =
      simpleFieldsComplexity + (selectedFieldsResult.relationFieldsCount ?? 0);

    return (args.includeRecords ?? false)
      ? groupByQueryComplexity +
          selectedFieldsComplexity * getGroupLimit(args.limit)
      : groupByQueryComplexity;
  }
}
