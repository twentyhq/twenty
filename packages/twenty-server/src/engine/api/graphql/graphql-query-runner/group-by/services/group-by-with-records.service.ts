import { Inject, Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { type ObjectLiteral } from 'typeorm';

import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { type GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.types';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

const GROUPS_LIMIT = 50;
const RECORDS_PER_GROUP_LIMIT = 10;
const SUB_QUERY_PREFIX = 'sub_query_';

@Injectable()
export class GroupByWithRecordsService {
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  constructor() {}

  public async resolveWithRecords({
    queryBuilderWithGroupBy,
    queryBuilderWithFiltersAndWithoutGroupBy,
    groupByDefinitions,
    selectedFieldsResult,
    queryRunnerContext,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: GraphqlQuerySelectedFieldsResult;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
  }): Promise<CommonGroupByOutputItem[]> {
    const groupsResult = await queryBuilderWithGroupBy
      .limit(GROUPS_LIMIT)
      .getRawMany();

    if (groupsResult.length === 0) {
      return [];
    }

    const {
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
      repository,
    } = queryRunnerContext;

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations, // TODO - not handled for now
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps: objectMetadataMaps,
    });

    const queryBuilderWithPartitionBy = this.addPartitionByToQueryBuilder({
      queryBuilderForSubQuery: queryBuilderWithFiltersAndWithoutGroupBy,
      columnsToSelect,
      groupsResult,
      groupByDefinitions,
      repository,
    });

    const recordsResult = await queryBuilderWithPartitionBy.getRawMany();

    if (isDefined(selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: recordsResult.flatMap((group) => group.records),
        parentObjectRecordsAggregatedValues: {},
        relations: selectedFieldsResult.relations,
        aggregate: selectedFieldsResult.aggregate,
        limit: 5,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: selectedFieldsResult.select,
      });
    }

    return formatResultWithGroupByDimensionValues({
      groupsResult,
      recordsResult,
      groupByDefinitions,
      aggregateFieldNames: Object.keys(selectedFieldsResult.aggregate),
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });
  }

  private addPartitionByToQueryBuilder({
    queryBuilderForSubQuery,
    columnsToSelect,
    groupsResult,
    groupByDefinitions,
    repository,
  }: {
    queryBuilderForSubQuery: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    repository: WorkspaceRepository<ObjectLiteral>;
  }): WorkspaceSelectQueryBuilder<ObjectLiteral> {
    const groupByExpressions = groupByDefinitions
      .map((def) => def.expression)
      .join(', ');

    const groupByAliases = groupByDefinitions
      .map((def) => `"${def.alias}"`)
      .join(', ');

    const groupConditions = this.buildGroupConditions(
      groupsResult,
      groupByDefinitions,
      queryBuilderForSubQuery,
    );

    const recordSelectWithAlias = Object.keys(columnsToSelect)
      .map((col) => `"${col}" as "${SUB_QUERY_PREFIX}${col}"`)
      .join(', ');

    const groupBySelectWithAlias = groupByDefinitions
      .map((def) => `${def.expression} as "${def.alias}"`)
      .join(', ');

    const subQuery = queryBuilderForSubQuery
      .select(recordSelectWithAlias)
      .addSelect(groupBySelectWithAlias)
      .addSelect(`ROW_NUMBER() OVER (PARTITION BY ${groupByExpressions})`, 'rn')
      .andWhere(groupConditions);

    let mainQueryQueryBuilder = repository.createQueryBuilder();

    const mainQuery = mainQueryQueryBuilder
      .from(`(${subQuery.getQuery()})`, 'ranked_records')
      .setParameters(queryBuilderForSubQuery.expressionMap.parameters)
      .select(groupByAliases)
      .addSelect(
        `JSON_AGG(
        CASE WHEN rn <= ${RECORDS_PER_GROUP_LIMIT} THEN
          JSON_BUILD_OBJECT(
            ${[
              ...Object.keys(columnsToSelect).map(
                (col) => `'${col}', "${SUB_QUERY_PREFIX}${col}"`,
              ),
              ...groupByDefinitions.map(
                (def) => `'${def.alias}', "${def.alias}"`,
              ),
            ].join(',\n              ')}
          )
        END
      ) FILTER (WHERE rn <= ${RECORDS_PER_GROUP_LIMIT})`,
        'records',
      )
      .groupBy(groupByAliases);

    // Remove initial "from" condition (typeOrm limitation)
    mainQuery.expressionMap.aliases = mainQuery.expressionMap.aliases.filter(
      (alias) => isDefined(alias.subQuery),
    );

    return mainQuery as WorkspaceSelectQueryBuilder<ObjectLiteral>;
  }

  private buildGroupConditions(
    groupsResult: Array<Record<string, unknown>>,
    groupByDefinitions: GroupByDefinition[],
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
  ): string {
    const groupConditions = groupsResult.map((group, groupIndex) => {
      const conditions = groupByDefinitions
        .map((def, defIndex) => {
          const paramName = `groupValue_${groupIndex}_${defIndex}`;

          queryBuilder.setParameter(paramName, group[def.alias]);

          return `${def.expression} = :${paramName}`;
        })
        .join(' AND ');

      return `(${conditions})`;
    });

    return `(${groupConditions.join(' OR ')})`;
  }
}
