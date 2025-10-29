import { Inject, Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { type GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.types';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

const GROUPS_LIMIT = 50;
const RECORDS_PER_GROUP_LIMIT = 10;
const RELATIONS_PER_RECORD_LIMIT = 5;
const SUB_QUERY_PREFIX = 'sub_query_';

@Injectable()
export class GroupByWithRecordsService {
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;
  constructor() {}

  public async resolveWithRecords({
    queryBuilderWithGroupBy,
    queryBuilderWithFiltersAndWithoutGroupBy,
    groupByDefinitions,
    selectedFieldsResult,
    queryRunnerContext,
    orderByForRecords,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: GraphqlQuerySelectedFieldsResult;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    orderByForRecords: ObjectRecordOrderBy;
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
      relations: selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps: objectMetadataMaps,
    });

    const queryBuilderWithPartitionBy = this.addPartitionByToQueryBuilder({
      queryBuilderForSubQuery: queryBuilderWithFiltersAndWithoutGroupBy,
      columnsToSelect,
      groupsResult,
      groupByDefinitions,
      repository,
      orderByForRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
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
        limit: RELATIONS_PER_RECORD_LIMIT,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: selectedFieldsResult.select,
      });
    }

    return await formatResultWithGroupByDimensionValues({
      groupsResult,
      recordsResult,
      groupByDefinitions,
      aggregateFieldNames: Object.keys(selectedFieldsResult.aggregate),
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      processRecord: (record: ObjectRecord) =>
        this.commonResultGettersService.processRecord(
          record,
          objectMetadataItemWithFieldMaps.id,
          objectMetadataMaps,
          authContext.workspace.id,
        ),
    });
  }

  private addPartitionByToQueryBuilder({
    queryBuilderForSubQuery,
    columnsToSelect,
    groupsResult,
    groupByDefinitions,
    repository,
    orderByForRecords,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
  }: {
    queryBuilderForSubQuery: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    repository: WorkspaceRepository<ObjectLiteral>;
    orderByForRecords: ObjectRecordOrderBy;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
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

    if (!isEmpty(orderByForRecords)) {
      const graphqlQueryParser = new GraphqlQueryParser(
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );

      graphqlQueryParser.applyOrderToBuilder(
        subQuery,
        orderByForRecords,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    }

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
          const paramValue = group[def.alias];

          if (!isDefined(paramValue)) {
            return `${def.expression} IS NULL`;
          }
          queryBuilder.setParameter(paramName, paramValue);

          return `${def.expression} = :${paramName}`;
        })
        .join(' AND ');

      return `(${conditions})`;
    });

    return `(${groupConditions.join(' OR ')})`;
  }
}
