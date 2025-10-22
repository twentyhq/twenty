import { isDefined } from 'class-validator';
import { type ObjectRecord } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type GraphqlQueryResolverExecutionArgs } from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { type IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';
import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.types';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

const GROUPS_LIMIT = 50;
const RECORDS_PER_GROUP_LIMIT = 10;
const SUB_QUERY_PREFIX = 'sub_query_';

export class GroupByWithRecordService {
  constructor() {}

  public async resolveWithRecords({
    queryBuilderWithGroupBy,
    queryBuilderWithFiltersAndWithoutGroupBy,
    groupByDefinitions,
    executionArgs,
    objectMetadataItemWithFieldMaps,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    executionArgs: GraphqlQueryResolverExecutionArgs<GroupByResolverArgs>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[]> {
    const groupsResult = await queryBuilderWithGroupBy
      .limit(GROUPS_LIMIT)
      .getRawMany();

    if (groupsResult.length === 0) {
      return [];
    }

    const selectedFieldsResult =
      executionArgs.graphqlQueryParser.parseSelectedFields(
        objectMetadataItemWithFieldMaps,
        executionArgs.graphqlQuerySelectedFieldsResult.select,
        executionArgs.options.objectMetadataMaps,
      );

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps: executionArgs.options.objectMetadataMaps,
    });

    const queryBuilderWithPartitionBy = this.addPartitionByToQueryBuilder({
      queryBuilderForSubQuery: queryBuilderWithFiltersAndWithoutGroupBy,
      columnsToSelect,
      groupsResult,
      groupByDefinitions,
      executionArgs,
    });

    const recordsResult = await queryBuilderWithPartitionBy.getRawMany();

    return this.combineGroupAndRecordsResults(
      groupsResult,
      recordsResult,
      groupByDefinitions,
    );
  }

  private addPartitionByToQueryBuilder({
    queryBuilderForSubQuery,
    columnsToSelect,
    groupsResult,
    groupByDefinitions,
    executionArgs,
  }: {
    queryBuilderForSubQuery: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    executionArgs: GraphqlQueryResolverExecutionArgs<GroupByResolverArgs>;
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

    let mainQueryQueryBuilder = executionArgs.repository.createQueryBuilder();

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

    // Remove initial from condition (typeOrm limitation)
    mainQuery.expressionMap.aliases = mainQuery.expressionMap.aliases.filter(
      (alias) => isDefined(alias.subQuery),
    );

    return mainQuery as WorkspaceSelectQueryBuilder<ObjectLiteral>;
  }

  private buildGroupConditions(
    groupsResult: Array<Record<string, unknown>>,
    groupByDefinitions: GroupByDefinition[],
  ): string {
    if (groupsResult.length === 0) {
      return '';
    }

    const groupConditions = groupsResult.map((group) => {
      const conditions = groupByDefinitions
        .map((def) => {
          const value = group[def.alias];

          return `${def.expression} = ${this.formatValueForSql(value)}`;
        })
        .join(' AND ');

      return `(${conditions})`;
    });

    return `${groupConditions.join(' OR ')}`;
  }

  private combineGroupAndRecordsResults(
    groupsResult: Array<Record<string, unknown>>,
    recordsResult: Array<Record<string, unknown>>,
    groupByDefinitions: GroupByDefinition[],
  ): IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>[] {
    const recordsByGroupKey = new Map<string, Array<Record<string, unknown>>>();

    recordsResult.forEach((entry) => {
      const groupKey = this.createGroupKey(entry, groupByDefinitions);

      const sampleRecords =
        (entry.records as Array<Record<string, unknown>>) ?? [];

      recordsByGroupKey.set(groupKey, sampleRecords);
    });

    return groupsResult.map((group) => {
      const groupKey = this.createGroupKey(group, groupByDefinitions);
      const records = recordsByGroupKey.get(groupKey) || [];

      const edges = records.map(
        (record: Record<string, unknown>, index: number) => ({
          node: record as ObjectRecord,
          cursor: this.encodeCursor(record, index),
        }),
      );

      return {
        groupByDimensionValues: groupByDefinitions.map((def) =>
          String(group[def.alias]),
        ),
        ...group,
        edges,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: (group._count_id as number) || records.length || 0,
      };
    });
  }

  private createGroupKey(
    group: Record<string, unknown>,
    groupByDefinitions: GroupByDefinition[],
  ): string {
    return groupByDefinitions.map((def) => String(group[def.alias])).join('|');
  }

  private formatValueForSql(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }

    return `'${String(value).replace(/'/g, "''")}'`;
  }

  private encodeCursor(record: Record<string, unknown>, index: number): string {
    const cursorData = {
      id: record.id,
      index,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
}
