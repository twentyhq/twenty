import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { getObjectAlias } from 'src/engine/api/common/common-query-runners/utils/get-object-alias-for-group-by.util';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.type';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { getGroupLimit } from 'src/engine/api/graphql/graphql-query-runner/group-by/utils/get-group-limit.util';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

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
    groupLimit,
    offsetForRecords,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: CommonSelectedFieldsResult;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    orderByForRecords: ObjectRecordOrderBy;
    groupLimit?: number;
    offsetForRecords?: number;
  }): Promise<CommonGroupByOutputItem[]> {
    const effectiveGroupLimit = getGroupLimit(groupLimit);

    const groupsResult = await queryBuilderWithGroupBy
      .limit(effectiveGroupLimit)
      .getRawMany();

    if (groupsResult.length === 0) {
      return [];
    }

    const {
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      repository,
    } = queryRunnerContext;

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const queryBuilderWithPartitionBy = this.addPartitionByToQueryBuilder({
      queryBuilderForSubQuery: queryBuilderWithFiltersAndWithoutGroupBy,
      columnsToSelect,
      groupsResult,
      groupByDefinitions,
      repository,
      orderByForRecords,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      offsetForRecords,
    });

    const recordsResult = await queryBuilderWithPartitionBy.getRawMany();

    const allRecords = recordsResult
      .flatMap((group) => group.records)
      .filter(isDefined);

    if (!isEmpty(selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: allRecords,
        parentObjectRecordsAggregatedValues: {},
        relations: selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
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
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      processRecord: (record: ObjectRecord) =>
        this.commonResultGettersService.processRecord(
          record,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
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
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    offsetForRecords = 0,
  }: {
    queryBuilderForSubQuery: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    repository: WorkspaceRepository<ObjectLiteral>;
    orderByForRecords: ObjectRecordOrderBy;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    offsetForRecords?: number;
  }): WorkspaceSelectQueryBuilder<ObjectLiteral> {
    const groupByAliases = groupByDefinitions
      .map((def) => `"${def.alias}"`)
      .join(', ');

    const groupConditions = this.buildGroupConditions(
      groupsResult,
      groupByDefinitions,
      queryBuilderForSubQuery,
    );

    const objectAlias = getObjectAlias(flatObjectMetadata);

    const recordSelectWithAlias = Object.keys(columnsToSelect)
      .map((col) => `"${objectAlias}"."${col}" as "${SUB_QUERY_PREFIX}${col}"`)
      .join(', ');

    const groupBySelectWithAlias = groupByDefinitions
      .map((def) => `${def.expression} as "${def.alias}"`)
      .join(', ');

    const subQuery = queryBuilderForSubQuery
      .select(recordSelectWithAlias)
      .addSelect(groupBySelectWithAlias)
      .andWhere(groupConditions);

    this.applyPartitionByToBuilder({
      groupByDefinitions,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      orderByForRecords,
      queryBuilder: subQuery,
    });

    if (!isEmpty(orderByForRecords)) {
      const graphqlQueryParser = new GraphqlQueryParser(
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );

      graphqlQueryParser.applyOrderToBuilder(
        subQuery,
        orderByForRecords,
        flatObjectMetadata.nameSingular,
      );
    }

    let mainQueryQueryBuilder = repository.createQueryBuilder();

    const pageStart = offsetForRecords;
    const pageEnd = offsetForRecords + RECORDS_PER_GROUP_LIMIT;

    const mainQuery = mainQueryQueryBuilder
      .from(`(${subQuery.getQuery()})`, 'ranked_records')
      .setParameters(queryBuilderForSubQuery.expressionMap.parameters)

      .select(groupByAliases)
      .addSelect(
        `JSON_AGG(
        CASE WHEN record_row_number > ${pageStart} AND record_row_number <= ${pageEnd} THEN
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
      ) FILTER (WHERE record_row_number > ${pageStart} AND record_row_number <= ${pageEnd})`,
        'records',
      )
      .groupBy(groupByAliases);

    // Remove initial "from" condition (typeOrm limitation)
    mainQuery.expressionMap.aliases = mainQuery.expressionMap.aliases.filter(
      (alias) => isDefined(alias.subQuery),
    );

    return mainQuery as WorkspaceSelectQueryBuilder<ObjectLiteral>;
  }

  private applyPartitionByToBuilder({
    groupByDefinitions,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    orderByForRecords,
    queryBuilder,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>;
    groupByDefinitions: GroupByDefinition[];
    orderByForRecords: ObjectRecordOrderBy;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }) {
    const groupByExpressions = groupByDefinitions
      .map((def) => def.expression)
      .join(', ');

    const hasOrderByForRecords = !isEmpty(orderByForRecords);

    if (hasOrderByForRecords) {
      const graphqlQueryParser = new GraphqlQueryParser(
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );

      const orderByRawSQL = graphqlQueryParser.getOrderByRawSQL(
        orderByForRecords,
        flatObjectMetadata.nameSingular,
      );

      if (isNonEmptyString(orderByRawSQL)) {
        return queryBuilder.addSelect(
          `ROW_NUMBER() OVER (PARTITION BY ${groupByExpressions} ${orderByRawSQL})`,
          'record_row_number',
        );
      }
    }

    return queryBuilder.addSelect(
      `ROW_NUMBER() OVER (PARTITION BY ${groupByExpressions})`,
      'record_row_number',
    );
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
