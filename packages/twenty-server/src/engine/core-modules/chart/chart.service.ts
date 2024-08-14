import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChartResult } from 'src/engine/core-modules/chart/dtos/chart-result.dto';
import { AliasPrefix } from 'src/engine/core-modules/chart/types/alias-prefix.type';
import { CommonTableExpressionDefinition } from 'src/engine/core-modules/chart/types/common-table-expression-definition.type';
import { QueryRelation } from 'src/engine/core-modules/chart/types/query-relation.type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  ChartMeasure,
  ChartWorkspaceEntity,
} from 'src/modules/charts/standard-objects/chart.workspace-entity';

// TODO:
// 1. Composite type support (most importantly for currencies)

@Injectable()
export class ChartService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  private async getRelationMetadata(
    workspaceId: string,
    fieldMetadataId?: string,
  ) {
    if (!fieldMetadataId) return;
    const [relationMetadata] = await this.relationMetadataRepository.find({
      where: [
        {
          fromFieldMetadataId: fieldMetadataId,
        },
        {
          toFieldMetadataId: fieldMetadataId,
        },
      ],
      relations: [
        'fromObjectMetadata',
        'toObjectMetadata',
        'fromFieldMetadata',
        'toFieldMetadata',
        'fromObjectMetadata.fields',
        'toObjectMetadata.fields',
      ],
    });

    if (relationMetadata instanceof NotFoundException) throw relationMetadata;

    return relationMetadata;
  }

  private async getOppositeObjectMetadata(
    relationMetadata: RelationMetadataEntity,
    objectMetadata: ObjectMetadataEntity,
  ) {
    const oppositeObjectMetadata =
      relationMetadata?.fromObjectMetadataId === objectMetadata.id
        ? relationMetadata?.toObjectMetadata
        : relationMetadata?.fromObjectMetadata;

    if (!oppositeObjectMetadata) throw new Error();

    return oppositeObjectMetadata;
  }

  private computeJoinTableAlias(aliasPrefix: AliasPrefix, i: number) {
    return `table_${aliasPrefix}_${i}`;
  }

  private async getQueryRelation(
    dataSourceSchemaName: string,
    objectMetadata: ObjectMetadataEntity,
    index: number,
    sourceTableName: string,
    aliasPrefix: AliasPrefix,
    oppositeObjectMetadata: ObjectMetadataEntity,
    relationMetadata: RelationMetadataEntity,
    fieldMetadataId: string,
  ): Promise<QueryRelation | undefined> {
    const fromIsExistingTable =
      relationMetadata?.fromObjectMetadataId === objectMetadata.id;
    const toJoinFieldName = computeColumnName(
      relationMetadata.toFieldMetadata.name,
      {
        isForeignKey: true,
      },
    );
    const fromJoinFieldName = 'id';

    const fieldMetadata =
      relationMetadata.toFieldMetadataId === fieldMetadataId
        ? relationMetadata.toFieldMetadata
        : relationMetadata.fromFieldMetadata;

    const originalTableName = computeObjectTargetTable(oppositeObjectMetadata);

    const commonTableExpressionDefinition =
      await this.getCommonTableExpressionDefinition(
        dataSourceSchemaName,
        originalTableName,
        fieldMetadata.type,
        fieldMetadata.name,
      );

    const rightTableName =
      commonTableExpressionDefinition?.resultSetName ?? originalTableName;

    switch (relationMetadata?.relationType) {
      case RelationMetadataType.ONE_TO_MANY: {
        return {
          tableName: rightTableName,
          tableAlias: this.computeJoinTableAlias(aliasPrefix, index),
          fieldName: fromIsExistingTable ? toJoinFieldName : fromJoinFieldName,
          joinTarget: {
            tableAlias:
              index === 0
                ? sourceTableName
                : this.computeJoinTableAlias(aliasPrefix, index - 1),
            fieldName: fromIsExistingTable
              ? fromJoinFieldName
              : toJoinFieldName,
          },
          withQuery: commonTableExpressionDefinition?.withQuery,
        };
      }
      default:
        throw new Error(
          `Chart query construction is not implemented for relation type '${relationMetadata?.relationType}'`,
        );
    }
  }

  private async getQueryRelations(
    dataSourceSchemaName: string,
    workspaceId: string,
    sourceObjectNameSingular: string,
    aliasPrefix: AliasPrefix,
    fieldPath?: string[],
  ) {
    if (!fieldPath || fieldPath.length === 0) return [];
    let objectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: sourceObjectNameSingular },
        },
      );
    const sourceTableName = computeObjectTargetTable(objectMetadata);
    const joinOperations: QueryRelation[] = [];

    for (let i = 0; i < fieldPath.length; i++) {
      const fieldMetadataId = fieldPath[i];

      const relationMetadata = await this.getRelationMetadata(
        workspaceId,
        fieldMetadataId,
      );

      if (!relationMetadata) break;

      const oppositeObjectMetadata = await this.getOppositeObjectMetadata(
        relationMetadata,
        objectMetadata,
      );

      const joinOperation = await this.getQueryRelation(
        dataSourceSchemaName,
        objectMetadata,
        i,
        sourceTableName,
        aliasPrefix,
        oppositeObjectMetadata,
        relationMetadata,
        fieldMetadataId,
      );

      if (!joinOperation) break;

      joinOperations.push(joinOperation);
      objectMetadata = oppositeObjectMetadata;
    }

    return joinOperations;
  }

  private getJoinClauses(
    dataSourceSchema: string,
    chartQueryRelations: QueryRelation[],
  ): string[] {
    return chartQueryRelations.map((joinOperation, i) => {
      if (!joinOperation.joinTarget) {
        throw new Error('Missing join target');
      }

      return `JOIN "${dataSourceSchema}"."${joinOperation.tableName}" "${joinOperation.tableAlias}" ON "${joinOperation.joinTarget.tableAlias}"."${joinOperation.joinTarget.fieldName}" = "${joinOperation.tableAlias}"."${
        joinOperation.fieldName
      }"`;
    });
  }

  /**
   *
   * @param chartMeasure
   * @param targetColumnName e.g. 'table_1.employees'
   * @returns
   */
  private getMeasureSelectColumn(
    chartMeasure: ChartMeasure,
    targetQualifiedColumn: string,
  ) {
    if (!targetQualifiedColumn && chartMeasure !== ChartMeasure.COUNT) {
      throw new Error(
        'Chart measure must be count when target column is undefined',
      );
    }

    switch (chartMeasure) {
      case ChartMeasure.COUNT:
        return 'COUNT(*) as measure';
      case ChartMeasure.AVERAGE:
        return `AVG(${targetQualifiedColumn}) as measure`;
      case ChartMeasure.MIN:
        return `MIN(${targetQualifiedColumn}) as measure`;
      case ChartMeasure.MAX:
        return `MAX(${targetQualifiedColumn}) as measure`;
      case ChartMeasure.SUM:
        return `SUM(${targetQualifiedColumn}) as measure`;
    }
  }

  private async getFieldMetadata(workspaceId, fieldMetadataId) {
    return await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
      where: {
        id: fieldMetadataId,
      },
    });
  }

  private async getQualifiedColumn(
    workspaceId: string,
    targetQueryRelations: QueryRelation[],
    sourceTableName: string,
    fieldPath?: string[],
  ) {
    const lastFieldMetadataId = fieldPath?.[fieldPath?.length - 1];

    const columnName = (
      await this.getFieldMetadata(workspaceId, lastFieldMetadataId)
    )?.name;

    const lastQueryRelation: QueryRelation | undefined =
      targetQueryRelations[targetQueryRelations.length - 1];
    const tableAlias = lastQueryRelation?.tableAlias ?? sourceTableName;

    return `"${tableAlias}"."${columnName}"`;
  }

  // When are CTEs needed?
  // For last target table and last group by table if last field metadatatype requires post processing (composite, rating, etc)
  private async getCommonTableExpressionDefinition(
    dataSourceSchemaName: string,
    baseTableName: string,
    fieldMetadataType?: FieldMetadataType,
    fieldName?: string,
  ): Promise<CommonTableExpressionDefinition | undefined> {
    const resultSetName = `${baseTableName}_cte`; // TODO: Unique identifier

    switch (fieldMetadataType) {
      case FieldMetadataType.CURRENCY:
        return {
          resultSetName,
          withQuery: `
            WITH "${resultSetName}" AS (
              SELECT
                "${fieldName}AmountMicros" / 1000000.0 *
                CASE "${fieldName}CurrencyCode"
                  WHEN 'EUR' THEN 1.10
                  WHEN 'GBP' THEN 1.29
                  WHEN 'USD' THEN 1.00
                  -- More
                  ELSE 1.0
                END AS "${fieldName}"
              FROM
                "${dataSourceSchemaName}"."${baseTableName}"
            )
          `,
        };
    }
  }

  private async getSourceQueryRelation(
    dataSourceSchemaName: string,
    workspaceId: string,
    chart: ChartWorkspaceEntity,
  ): Promise<QueryRelation> {
    const sourceObjectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: chart?.sourceObjectNameSingular },
        },
      );

    const baseTableName = computeObjectTargetTable(sourceObjectMetadata);

    const fieldMetadataId = chart.target?.[0];

    const fieldMetadata = await this.getFieldMetadata(
      workspaceId,
      fieldMetadataId,
    );

    const commonTableExpressionDefinition =
      await this.getCommonTableExpressionDefinition(
        dataSourceSchemaName,
        baseTableName,
        fieldMetadata?.type,
        fieldMetadata?.name,
      );

    const tableName =
      commonTableExpressionDefinition?.resultSetName ?? baseTableName;

    return {
      tableName: tableName,
      tableAlias: tableName,
      fieldName: fieldMetadata?.name,
      withQuery: commonTableExpressionDefinition?.withQuery,
    };
  }

  private async getChart(workspaceId: string, chartId: string) {
    // TODO: Enforce workspaceId

    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);

    return await repository.findOneByOrFail({ id: chartId });
  }

  async run(workspaceId: string, chartId: string): Promise<ChartResult> {
    const chart = await this.getChart(workspaceId, chartId);

    const dataSourceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const sourceQueryRelation = await this.getSourceQueryRelation(
      dataSourceSchemaName,
      workspaceId,
      chart,
    );

    const targetQueryRelations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      chart.sourceObjectNameSingular,
      'target',
      chart.target,
    );

    console.log('targetQueryRelations', targetQueryRelations);

    const targetJoinClauses = this.getJoinClauses(
      dataSourceSchemaName,
      targetQueryRelations,
    );

    const targetQualifiedColumn = await this.getQualifiedColumn(
      workspaceId,
      targetQueryRelations,
      sourceQueryRelation.tableName,
      chart.target,
    );

    /*const groupByJoinOperations = await this.getJoinOperations(
      workspaceId,
      chart.sourceObjectNameSingular,
      'group_by',
      chart.groupBy,
    );

    const groupByJoinClauses = this.getJoinClauses(
      dataSourceSchema,
      groupByJoinOperations,
    );

    const [groupByTableAlias, groupByColumnName] =
      await this.getTableAliasAndColumn(
        workspaceId,
        groupByJoinOperations,
        sourceTableName,
        chart.groupBy,
      );

    const groupBySelectColumn =
      chart.groupBy && chart.groupBy.length > 0
        ? `"${groupByTableAlias}"."${groupByColumnName}"`
        : undefined;

    const groupByClause =
      chart.groupBy && chart.groupBy.length > 0
        ? `GROUP BY "${groupByTableAlias}"."${groupByColumnName}"`
        : '';*/

    const allQueryRelations = [
      sourceQueryRelation,
      targetQueryRelations,
      // groupByQueryRelations,
    ].flat();

    const commonTableExpressions = allQueryRelations
      .map((joinOperation) => joinOperation.withQuery)
      .join('\n');

    console.log('commonTableExpressions', commonTableExpressions);

    const measureSelectColumn = this.getMeasureSelectColumn(
      chart.measure,
      targetQualifiedColumn,
    );

    const selectColumns = [
      measureSelectColumn /* , groupBySelectColumn */,
    ].filter((col) => !!col);

    const joinClausesString = [targetJoinClauses /* , groupByJoinClauses */]
      .flat()
      .filter((col) => col)
      .join('\n');

    const sqlQuery = `
      ${commonTableExpressions}
      SELECT ${selectColumns.join(', ')}
      FROM ${sourceQueryRelation.withQuery ? '' : `"${dataSourceSchemaName}".`}"${sourceQueryRelation.tableName}"
      ${joinClausesString}
      ${'' /* groupByClause */};
    `;

    console.log('sqlQuery\n', sqlQuery);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      sqlQuery,
      [],
      workspaceId,
    );

    console.log('result', JSON.stringify(result, undefined, 2));

    return { chartResult: JSON.stringify(result) };
  }
}
