import { Injectable } from '@nestjs/common';

import {
  CompositeFieldSubFieldName,
  FieldMetadataType,
  ObjectRecord,
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

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { removeQuotes } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

@Injectable()
export class GraphqlQueryGroupByResolverService extends GraphqlQueryBaseResolverService<
  GroupByResolverArgs,
  IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]
> {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewService: ViewService,
  ) {
    super();
  }

  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<GroupByResolverArgs>,
    _featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;

    const objectMetadataNameSingular =
      objectMetadataItemWithFieldMaps.nameSingular;

    let queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataNameSingular,
    );

    let appliedFilters =
      executionArgs.args.filter ?? ({} as ObjectRecordFilter);

    if (executionArgs.args.viewId) {
      appliedFilters = await this.addFiltersFromView({
        executionArgs,
        objectMetadataItemWithFieldMaps,
        appliedFilters,
      });
    }

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataNameSingular,
      appliedFilters,
    );

    executionArgs.graphqlQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      appliedFilters,
    );

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields:
        executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
      queryBuilder,
      objectMetadataNameSingular,
    });

    const groupByFields = parseGroupByArgs(
      executionArgs.args,
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

    if (executionArgs.args.omitNullValues) {
      const aggregateFields =
        executionArgs.graphqlQuerySelectedFieldsResult.aggregate ?? {};

      Object.values(aggregateFields).forEach((aggregationField) => {
        const aggregateExpression =
          ProcessAggregateHelper.getAggregateExpression(
            aggregationField,
            objectMetadataNameSingular,
          );

        if (aggregateExpression) {
          queryBuilder.andHaving(`${aggregateExpression} IS NOT NULL`);

          const isNumericReturningAggregate = this.isNumericReturningAggregate(
            aggregationField.aggregateOperation,
            aggregationField.fromFieldType,
          );

          if (isNumericReturningAggregate) {
            queryBuilder.andHaving(`${aggregateExpression} != 0`);
          }
        }
      });
    }

    executionArgs.graphqlQueryParser.applyGroupByOrderToBuilder(
      queryBuilder,
      executionArgs.args.orderBy ?? [],
      groupByFields,
    );

    const result = await queryBuilder.getRawMany();

    return formatResultWithGroupByDimensionValues(
      result,
      groupByDefinitions,
      Object.keys(executionArgs.graphqlQuerySelectedFieldsResult.aggregate),
    );
  }

  private async addFiltersFromView({
    executionArgs,
    objectMetadataItemWithFieldMaps,
    appliedFilters,
  }: {
    executionArgs: GraphqlQueryResolverExecutionArgs<GroupByResolverArgs>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    appliedFilters: ObjectRecordFilter;
  }): Promise<ObjectRecordFilter> {
    assertIsDefinedOrThrow(executionArgs.args.viewId);

    const workspaceId = executionArgs.options.authContext.workspace?.id;

    assertIsDefinedOrThrow(workspaceId, WorkspaceNotFoundDefaultError);

    const viewFilters = await this.viewFilterService.findByViewId(
      workspaceId,
      executionArgs.args.viewId,
    );

    const viewFilterGroups = await this.viewFilterGroupService.findByViewId(
      workspaceId,
      executionArgs.args.viewId,
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
      view = await this.viewService.findById(
        executionArgs.args.viewId,
        workspaceId,
      );
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

  private isNumericReturningAggregate(
    operation: AggregateOperations,
    fromFieldType: FieldMetadataType,
  ): boolean {
    if (
      operation === AggregateOperations.COUNT ||
      operation === AggregateOperations.COUNT_UNIQUE_VALUES ||
      operation === AggregateOperations.COUNT_EMPTY ||
      operation === AggregateOperations.COUNT_NOT_EMPTY ||
      operation === AggregateOperations.COUNT_TRUE ||
      operation === AggregateOperations.COUNT_FALSE ||
      operation === AggregateOperations.PERCENTAGE_EMPTY ||
      operation === AggregateOperations.PERCENTAGE_NOT_EMPTY
    ) {
      return true;
    }

    if (
      operation === AggregateOperations.MIN ||
      operation === AggregateOperations.MAX ||
      operation === AggregateOperations.AVG ||
      operation === AggregateOperations.SUM
    ) {
      return [
        FieldMetadataType.NUMBER,
        FieldMetadataType.NUMERIC,
        FieldMetadataType.CURRENCY,
      ].includes(fromFieldType);
    }

    return false;
  }

  async validate(
    _args: GroupByResolverArgs<ObjectRecordFilter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {}
}
