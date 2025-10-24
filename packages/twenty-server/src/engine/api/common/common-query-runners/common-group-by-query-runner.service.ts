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
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  GroupByQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { removeQuotes } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

@Injectable()
export class CommonGroupByQueryRunnerService extends CommonBaseQueryRunnerService<
  GroupByQueryArgs,
  CommonGroupByOutputItem[]
> {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewService: ViewService,
  ) {
    super();
  }

  protected readonly operationName = CommonQueryNames.GROUP_BY;

  async run(
    args: CommonExtendedInput<GroupByQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonGroupByOutputItem[]> {
    const {
      repository,
      commonQueryParser,
      objectMetadataItemWithFieldMaps,
      authContext,
    } = queryRunnerContext;

    const objectMetadataNameSingular =
      objectMetadataItemWithFieldMaps.nameSingular;

    let queryBuilder = repository.createQueryBuilder(
      objectMetadataNameSingular,
    );

    let appliedFilters = args.filter ?? ({} as ObjectRecordFilter);

    if (isDefined(args.viewId)) {
      appliedFilters = await this.addFiltersFromView({
        args,
        authContext,
        objectMetadataItemWithFieldMaps,
        appliedFilters,
      });
    }

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataNameSingular,
      appliedFilters,
    );

    commonQueryParser.applyDeletedAtToBuilder(queryBuilder, appliedFilters);

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: args.selectedFieldsResult.aggregate,
      queryBuilder,
      objectMetadataNameSingular,
    });

    const groupByFields = parseGroupByArgs(
      args,
      objectMetadataItemWithFieldMaps,
    );

    const groupByDefinitions = groupByFields.map((groupByField) => {
      const columnNameWithQuotes = `"${
        formatColumnNamesFromCompositeFieldAndSubfields(
          groupByField.fieldMetadata.name,
          groupByField.subFieldName ? [groupByField.subFieldName] : undefined,
        )[0]
      }"`;
      const alias =
        removeQuotes(columnNameWithQuotes) +
        (isGroupByDateField(groupByField)
          ? `_${groupByField.dateGranularity}`
          : '');

      return {
        columnNameWithQuotes,
        expression: getGroupByExpression({
          groupByField,
          columnNameWithQuotes,
        }),
        alias,
        dateGranularity: isGroupByDateField(groupByField)
          ? groupByField.dateGranularity
          : undefined,
      };
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

    const result = await queryBuilder.getRawMany();

    return formatResultWithGroupByDimensionValues(
      result,
      groupByDefinitions,
      Object.keys(args.selectedFieldsResult.aggregate),
    );
  }

  async processQueryResult(
    queryResult: CommonGroupByOutputItem[],
    _objectMetadataItemId: string,
    _objectMetadataMaps: ObjectMetadataMaps,
    _authContext: WorkspaceAuthContext,
  ): Promise<CommonGroupByOutputItem[]> {
    return queryResult;
  }

  private async addFiltersFromView({
    args,
    objectMetadataItemWithFieldMaps,
    appliedFilters,
    authContext,
  }: {
    args: GroupByQueryArgs;
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    appliedFilters: ObjectRecordFilter;
  }): Promise<ObjectRecordFilter> {
    assertIsDefinedOrThrow(args.viewId);

    const workspaceId = authContext.workspace.id;

    const viewFilters = await this.viewFilterService.findByViewId(
      workspaceId,
      args.viewId,
    );

    const viewFilterGroups = await this.viewFilterGroupService.findByViewId(
      workspaceId,
      args.viewId,
    );

    const recordFilters = viewFilters.map((viewFilter) => {
      const fieldMetadataItem =
        objectMetadataItemWithFieldMaps.fieldsById[viewFilter.fieldMetadataId];

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: convertViewFilterValueToString(viewFilter.value),
        type: getFilterTypeFromFieldType(fieldMetadataItem.type),
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

    const fields = Object.values(
      objectMetadataItemWithFieldMaps.fieldsById,
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
      filterValueDependencies: {},
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

  async validate(
    _args: CommonInput<GroupByQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {}

  async computeArgs(
    args: CommonInput<GroupByQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<GroupByQueryArgs>> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    return {
      ...args,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        args.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }
}
