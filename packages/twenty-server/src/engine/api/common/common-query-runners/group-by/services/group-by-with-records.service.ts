import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { getObjectAlias } from 'src/engine/api/common/common-query-runners/utils/get-object-alias-for-group-by.util';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type NestedRelationsReadPathOptions } from 'src/engine/api/common/types/nested-relations-read-path-options.type';
import { CommonQueryParser } from 'src/engine/api/common/common-query-parsers/common-query.parser';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/common/common-query-runners/group-by/utils/format-result-with-group-by-dimension-values.util';
import {
  RECORDS_PER_GROUP_LIMIT,
  RELATIONS_PER_RECORD_LIMIT,
  SUB_QUERY_ALIAS,
} from 'src/engine/api/common/common-query-runners/group-by/services/group-by-with-records.constants';
import { buildGroupByRecordConditions } from 'src/engine/api/common/common-query-runners/group-by/utils/build-group-by-record-conditions.util';
import { buildRecordJsonObjectSql } from 'src/engine/api/common/common-query-runners/group-by/utils/build-record-json-object-sql.util';
import { getGroupLimit } from 'src/engine/api/common/common-query-runners/group-by/utils/get-group-limit.util';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';
import { buildColumnsToSelect } from 'src/engine/api/common/utils/build-columns-to-select';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

@Injectable()
export class GroupByWithRecordsService {
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
    nestedRelationsReadPathOptions,
  }: {
    queryBuilderWithGroupBy: WorkspaceSelectQueryBuilder;
    queryBuilderWithFiltersAndWithoutGroupBy: WorkspaceSelectQueryBuilder;
    groupByDefinitions: GroupByDefinition[];
    selectedFieldsResult: CommonSelectedFieldsResult;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    readRepository: WorkspaceRepository;
    orderByForRecords: ObjectRecordOrderBy;
    groupLimit?: number;
    offsetForRecords?: number;
    nestedRelationsReadPathOptions: NestedRelationsReadPathOptions;
  }): Promise<CommonQueryRunResult<CommonGroupByOutputItem[]>> {
    const effectiveGroupLimit = getGroupLimit(groupLimit);

    const groupsResult = await queryBuilderWithGroupBy
      .limit(effectiveGroupLimit)
      .getRawMany();

    if (groupsResult.length === 0) {
      return { result: [], relationAggregatedValues: {} };
    }

    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const columnsToSelect = buildColumnsToSelect({
      selection: selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const { sql, parameters } = await this.buildRankedRecordsStatement({
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

    const relationAggregatedValues =
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: allRecords,
        selection: selectedFieldsResult,
        limit: RELATIONS_PER_RECORD_LIMIT,
        authContext,
        ...nestedRelationsReadPathOptions,
      });

    const groups = await formatResultWithGroupByDimensionValues({
      groupsResult,
      recordsResult,
      groupByDefinitions,
      aggregateFieldNames: Object.keys(selectedFieldsResult.aggregates),
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      selection: selectedFieldsResult,
      processRecord: (record: ObjectRecord) =>
        this.commonResultGettersService.processRecord({
          record,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          workspaceId: authContext.workspace.id,
          selection: selectedFieldsResult,
        }),
    });

    return { result: groups, relationAggregatedValues };
  }

  private async buildRankedRecordsStatement({
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
    subQueryBuilder: WorkspaceSelectQueryBuilder;
    columnsToSelect: Record<string, boolean>;
    groupsResult: Array<Record<string, unknown>>;
    groupByDefinitions: GroupByDefinition[];
    orderByForRecords: ObjectRecordOrderBy;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    offsetForRecords: number;
  }): Promise<{ sql: string; parameters: Record<string, unknown> }> {
    const objectAlias = getObjectAlias(flatObjectMetadata);

    subQueryBuilder.select([]);

    const subQueryAliasByColumnName = Object.fromEntries(
      Object.keys(columnsToSelect).map((columnName) => [
        columnName,
        buildColumnResultAlias(SUB_QUERY_ALIAS, columnName),
      ]),
    );

    for (const [columnName, subQueryAlias] of Object.entries(
      subQueryAliasByColumnName,
    )) {
      subQueryBuilder.addSelect(
        `"${objectAlias}"."${columnName}"`,
        subQueryAlias,
      );
    }

    for (const groupByDefinition of groupByDefinitions) {
      subQueryBuilder.addSelect(
        groupByDefinition.expression,
        groupByDefinition.alias,
      );
    }

    const { sql: groupConditionsSql, parameters: groupConditionParameters } =
      buildGroupByRecordConditions({ groupsResult, groupByDefinitions });

    subQueryBuilder.setParameters(groupConditionParameters);
    subQueryBuilder.andWhere(groupConditionsSql);

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

    await subQueryBuilder.applyRowLevelPermissions();

    const groupByAliases = groupByDefinitions
      .map((groupByDefinition) => `"${groupByDefinition.alias}"`)
      .join(', ');

    const pageStart = offsetForRecords;
    const pageEnd = offsetForRecords + RECORDS_PER_GROUP_LIMIT;

    const recordJsonObjectSql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName,
      groupByDefinitions,
    });

    const pageFilter = `record_row_number > ${pageStart} AND record_row_number <= ${pageEnd}`;

    const sql =
      `SELECT ${groupByAliases}, ` +
      `JSONB_AGG(${recordJsonObjectSql} ORDER BY record_row_number) ` +
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
    subQueryBuilder: WorkspaceSelectQueryBuilder;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): string {
    const partitionBy = groupByDefinitions
      .map((groupByDefinition) => groupByDefinition.expression)
      .join(', ');

    if (isEmpty(orderByForRecords)) {
      return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy})`;
    }

    const commonQueryParser = new CommonQueryParser({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const { orderByRawSQL, relationJoins } = commonQueryParser.getOrderByRawSQL(
      {
        orderBy: orderByForRecords,
        objectNameSingular: flatObjectMetadata.nameSingular,
      },
    );

    if (!isNonEmptyString(orderByRawSQL)) {
      return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy})`;
    }

    for (const joinInfo of relationJoins) {
      subQueryBuilder.leftJoin(
        `${flatObjectMetadata.nameSingular}.${joinInfo.joinAlias}`,
        joinInfo.joinAlias,
        undefined,
        { allowToManyJoin: true },
      );
    }

    return `ROW_NUMBER() OVER (PARTITION BY ${partitionBy} ${orderByRawSQL})`;
  }
}
