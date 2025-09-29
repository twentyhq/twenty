import { Injectable } from '@nestjs/common';

import {
  CompositeFieldSubFieldName,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  combineFilters,
  computeRecordGqlOperationFilter,
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
} from 'twenty-shared/utils';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { convertViewFilterOperand } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-view-filter-operands';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

@Injectable()
export class GraphqlQueryGroupByResolverService extends GraphqlQueryBaseResolverService<
  GroupByResolverArgs,
  IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]
> {
  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
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

    const groupByFields = this.parseGroupByArgs(
      executionArgs.args,
      objectMetadataItemWithFieldMaps,
    );

    const groupByColumnsWithQuotes = groupByFields.map((groupByField) => {
      return `"${
        formatColumnNamesFromCompositeFieldAndSubfields(
          groupByField.fieldMetadata.name,
          groupByField.subFieldName ? [groupByField.subFieldName] : undefined,
        )[0]
      }"`;
    });

    groupByColumnsWithQuotes.forEach((groupByColumn, index) => {
      queryBuilder.addSelect(groupByColumn);

      if (index === 0) {
        queryBuilder.groupBy(groupByColumn);
      } else {
        queryBuilder.addGroupBy(groupByColumn);
      }
    });

    let forwardPagination; // TODO
    const isGroupBy = true;

    executionArgs.graphqlQueryParser.applyOrderToBuilder(
      queryBuilder,
      executionArgs.args.orderBy ?? [],
      objectMetadataNameSingular,
      forwardPagination,
      isGroupBy,
    );

    const result = await queryBuilder.getRawMany();

    return this.formatResultWithGroupByDimensionValues(
      result,
      groupByColumnsWithQuotes,
    );
  }

  private formatResultWithGroupByDimensionValues(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any[],
    groupByColumnsWithQuotes: string[],
  ): IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] {
    let formattedResult: IGroupByConnection<
      ObjectRecord,
      IEdge<ObjectRecord>
    >[] = [];

    result.forEach((group) => {
      let dimensionValues = [];

      for (const groupByColumn of groupByColumnsWithQuotes) {
        const groupByColumnWithoutQuotes = groupByColumn.replace(/["']/g, '');

        dimensionValues.push(group[groupByColumnWithoutQuotes]);
      }
      formattedResult.push({
        groupByDimensionValues: dimensionValues,
        ...group,
      });
    });

    return formattedResult;
  }

  private parseGroupByArgs(
    args: GroupByResolverArgs,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): { fieldMetadata: FieldMetadataEntity; subFieldName?: string }[] {
    const groupByFieldNames = args.groupBy;

    const groupByFields = [];

    for (const fieldNames of groupByFieldNames) {
      if (Object.keys(fieldNames).length > 1) {
        throw new GraphqlQueryRunnerException(
          'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        );
      }
      for (const fieldName of Object.keys(fieldNames)) {
        const fieldMetadataId =
          objectMetadataItemWithFieldMaps.fieldIdByName[fieldName];
        const fieldMetadata =
          objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

        if (fieldNames[fieldName] === true) {
          groupByFields.push({
            fieldMetadata,
            subFieldName: undefined,
          });
          continue;
        } else if (typeof fieldNames[fieldName] === 'object') {
          if (Object.keys(fieldNames[fieldName]).length > 1) {
            throw new GraphqlQueryRunnerException(
              'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            );
          }
          for (const subFieldName of Object.keys(fieldNames[fieldName])) {
            if (fieldNames[fieldName][subFieldName] === true) {
              groupByFields.push({
                fieldMetadata,
                subFieldName,
              });
              continue;
            }
          }
        }
      }
    }

    return groupByFields;
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
        operand: convertViewFilterOperand(viewFilter.operand),
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
    }));

    const filtersFromView = computeRecordGqlOperationFilter({
      recordFilters,
      recordFilterGroups: recordFilterGroups,
      fields,
      filterValueDependencies: {},
    });

    appliedFilters = combineFilters([appliedFilters, filtersFromView]);

    return appliedFilters;
  }

  async validate(
    _args: GroupByResolverArgs<ObjectRecordFilter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {}
}
