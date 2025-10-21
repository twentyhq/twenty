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

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import {
  CommonQueryNames,
  GroupByQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { computeIsNumericReturningAggregate } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/compute-is-numeric-returning-aggregate.util';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { getGroupByExpression } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/get-group-by-expression.util';
import { isGroupByDateField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field.util';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { removeQuotes } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/remove-quote.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

@Injectable()
export class CommonGroupByQueryRunnerService extends CommonBaseQueryRunnerService {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewService: ViewService,
  ) {
    super();
  }

  async run({
    args,
    authContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: GroupByQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<CommonGroupByOutputItem[]> {
    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    const { repository } = await this.prepareQueryRunnerContext({
      authContext,
      objectMetadataItemWithFieldMaps,
    });

    //TODO : Refacto-common - QueryParser should be common branded service
    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      objectMetadataItemWithFieldMaps,
      args.selectedFields,
      objectMetadataMaps,
    );

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const objectMetadataNameSingular =
      objectMetadataItemWithFieldMaps.nameSingular;

    let queryBuilder = repository.createQueryBuilder(
      objectMetadataNameSingular,
    );

    let appliedFilters = args.filter ?? ({} as ObjectRecordFilter);

    if (args.viewId) {
      appliedFilters = await this.addFiltersFromView({
        args: processedArgs,
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
      selectedAggregatedFields: selectedFieldsResult.aggregate,
      queryBuilder,
      objectMetadataNameSingular,
    });

    const groupByFields = parseGroupByArgs(
      processedArgs,
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

    if (processedArgs.omitNullValues) {
      const aggregateFields = selectedFieldsResult.aggregate ?? {};

      Object.values(aggregateFields).forEach((aggregationField) => {
        const aggregateExpression =
          ProcessAggregateHelper.getAggregateExpression(
            aggregationField,
            objectMetadataNameSingular,
          );

        if (aggregateExpression) {
          queryBuilder.andHaving(`${aggregateExpression} IS NOT NULL`);

          const isNumericReturningAggregate =
            computeIsNumericReturningAggregate(
              aggregationField.aggregateOperation,
              aggregationField.fromFieldType,
            );

          if (isNumericReturningAggregate) {
            queryBuilder.andHaving(`${aggregateExpression} != 0`);
          }
        }
      });
    }

    commonQueryParser.applyGroupByOrderToBuilder(
      queryBuilder,
      processedArgs.orderBy ?? [],
      groupByFields,
    );

    const result = await queryBuilder.getRawMany();

    return formatResultWithGroupByDimensionValues(
      result,
      groupByDefinitions,
      Object.keys(selectedFieldsResult.aggregate),
    );
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

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: GroupByQueryArgs;
  }): Promise<GroupByQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.GROUP_BY,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as GroupByQueryArgs;

    return {
      ...hookedArgs,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        hookedArgs.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }
}
