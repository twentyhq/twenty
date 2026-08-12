import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsRelations, type ObjectLiteral } from 'typeorm';

import { ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { getObjectAlias } from 'src/engine/api/common/common-query-runners/utils/get-object-alias-for-group-by.util';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { addRelationJoinAliasToQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/add-relation-join-alias.util';
import { type RecordQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/types/record-query-builder.type';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { getGroupLimit } from 'src/engine/api/graphql/graphql-query-runner/group-by/utils/get-group-limit.util';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';

const RECORDS_PER_GROUP_LIMIT = 10;
const RELATIONS_PER_RECORD_LIMIT = 5;
const SUB_QUERY_PREFIX = 'sub_query_';

@Injectable()
export class GroupByWithRecordsV2Service {
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;

  public async resolveWithRecords({
    queryBuilderWithGroupBy,
    queryBuilderWithFiltersAndWithoutGroupBy,
    groupByDefinitions,
    selectedFieldsResult,
    queryRunnerContext,
    readRepository,
    orderByForRecords,
    groupLimit,
    offsetForRecords,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilderV2;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilderV2;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: CommonSelectedFieldsResult;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    readRepository: WorkspaceRepositoryV2;
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
    } = queryRunnerContext;

    const columnsToSelect = buildColumnsToSelect({
      select: selectedFieldsResult.select,
      relations: selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const { sql, parameters } = this.buildRankedRecordsStatement({
      subQueryBuilder: queryBuilderWithFiltersAndWithoutGroupBy,
      columnsToSelect,
      groupsResult,
      groupByDefinitions,
      orderByForRecords,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      offsetForRecords: offsetForRecords ?? 0,
    });

    const recordsResult = await readRepository.executeRaw<
      Record<string, unknown>
    >(sql, parameters);

    const allRecords = recordsResult
      .flatMap((group) => group.records as ObjectRecord[])
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

  private buildRankedRecordsStatement({
    subQueryBuilder,
    columnsToSelect,
    groupsResult,
    groupByDefinitions,
    orderByForRecords,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    offsetForRecords,
  }: {
    subQueryBuilder: WorkspaceSelectQueryBuilderV2;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    orderByForRecords: ObjectRecordOrderBy;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    offsetForRecords: number;
  }): { sql: string; parameters: Record<string, unknown> } {
    const objectAlias = getObjectAlias(flatObjectMetadata);

    subQueryBuilder.select([]);

    for (const columnName of Object.keys(columnsToSelect)) {
      subQueryBuilder.addSelect(
        `"${objectAlias}"."${columnName}"`,
        `${SUB_QUERY_PREFIX}${columnName}`,
      );
    }

    for (const groupByDefinition of groupByDefinitions) {
      subQueryBuilder.addSelect(
        groupByDefinition.expression,
        groupByDefinition.alias,
      );
    }

    const groupConditions = this.buildGroupConditions({
      groupsResult,
      groupByDefinitions,
      subQueryBuilder,
    });

    subQueryBuilder.andWhere(groupConditions);

    subQueryBuilder.addSelect(
      this.buildRowNumberExpression({
        groupByDefinitions,
        orderByForRecords,
        subQueryBuilder,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      'record_row_number',
    );

    subQueryBuilder.applyRowLevelPermissions();

    const groupByAliases = groupByDefinitions
      .map((groupByDefinition) => `"${groupByDefinition.alias}"`)
      .join(', ');

    const pageStart = offsetForRecords;
    const pageEnd = offsetForRecords + RECORDS_PER_GROUP_LIMIT;

    const jsonObjectEntries = [
      ...Object.keys(columnsToSelect).map(
        (columnName) => `'${columnName}', "${SUB_QUERY_PREFIX}${columnName}"`,
      ),
      ...groupByDefinitions.map(
        (groupByDefinition) =>
          `'${groupByDefinition.alias}', "${groupByDefinition.alias}"`,
      ),
    ].join(', ');

    const pageFilter = `record_row_number > ${pageStart} AND record_row_number <= ${pageEnd}`;

    const sql =
      `SELECT ${groupByAliases}, ` +
      `JSON_AGG(CASE WHEN ${pageFilter} THEN JSON_BUILD_OBJECT(${jsonObjectEntries}) END) ` +
      `FILTER (WHERE ${pageFilter}) AS "records" ` +
      `FROM (${subQueryBuilder.getQuery()}) AS "ranked_records" ` +
      `GROUP BY ${groupByAliases}`;

    return { sql, parameters: subQueryBuilder.getParameters() };
  }

  private buildRowNumberExpression({
    groupByDefinitions,
    orderByForRecords,
    subQueryBuilder,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    groupByDefinitions: GroupByDefinition[];
    orderByForRecords: ObjectRecordOrderBy;
    subQueryBuilder: WorkspaceSelectQueryBuilderV2;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): string {
    const partitionBy = groupByDefinitions
      .map((groupByDefinition) => groupByDefinition.expression)
      .join(', ');

    if (isEmpty(orderByForRecords)) {
      return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy})`;
    }

    const graphqlQueryParser = new GraphqlQueryParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    const { orderByRawSQL, relationJoins } =
      graphqlQueryParser.getOrderByRawSQL(
        orderByForRecords,
        flatObjectMetadata.nameSingular,
      );

    if (!isNonEmptyString(orderByRawSQL)) {
      return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy})`;
    }

    for (const joinInfo of relationJoins) {
      addRelationJoinAliasToQueryBuilder({
        queryBuilder: subQueryBuilder as unknown as RecordQueryBuilder,
        parentAlias: flatObjectMetadata.nameSingular,
        relationName: joinInfo.joinAlias,
      });
    }

    return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy} ${orderByRawSQL})`;
  }

  private buildGroupConditions({
    groupsResult,
    groupByDefinitions,
    subQueryBuilder,
  }: {
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    subQueryBuilder: WorkspaceSelectQueryBuilderV2;
  }): string {
    const groupConditions = groupsResult.map((group, groupIndex) => {
      const conditions = groupByDefinitions
        .map((groupByDefinition, definitionIndex) => {
          const parameterValue = group[groupByDefinition.alias];

          if (!isDefined(parameterValue)) {
            return `${groupByDefinition.expression} IS NULL`;
          }

          const parameterName = `groupValue_${groupIndex}_${definitionIndex}`;

          subQueryBuilder.setParameter(parameterName, parameterValue);

          return `${groupByDefinition.expression} = :${parameterName}`;
        })
        .join(' AND ');

      return `(${conditions})`;
    });

    return `(${groupConditions.join(' OR ')})`;
  }
}
