import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Repository } from 'typeorm';

import { ChartResult } from 'src/engine/core-modules/chart/dtos/chart-result.dto';
import { AliasPrefix } from 'src/engine/core-modules/chart/types/alias-prefix.type';
import { ChartQuery } from 'src/engine/core-modules/chart/types/chart-query';
import { CommonTableExpressionDefinition } from 'src/engine/core-modules/chart/types/common-table-expression-definition.type';
import { QueryRelation } from 'src/engine/core-modules/chart/types/query-relation.type';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
  ChartQueryMeasure,
  ChartWorkspaceEntity,
} from 'src/modules/charts/standard-objects/chart.workspace-entity';

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
    workspaceId: string,
    dataSourceSchemaName: string,
    objectMetadata: ObjectMetadataEntity,
    index: number,
    sourceTableName: string,
    aliasPrefix: AliasPrefix,
    oppositeObjectMetadata: ObjectMetadataEntity,
    relationMetadata: RelationMetadataEntity,
    fieldMetadataId: string,
    isLastRelationField?: boolean,
    measureFieldMetadata?: FieldMetadataEntity,
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

    const baseTableName = computeObjectTargetTable(oppositeObjectMetadata);

    const commonTableExpressionDefinition = isLastRelationField
      ? await this.getCommonTableExpressionDefinition(
          workspaceId,
          dataSourceSchemaName,
          baseTableName,
          measureFieldMetadata,
        )
      : undefined;

    const rightTableName =
      commonTableExpressionDefinition?.resultSetName ?? baseTableName;

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
    sourceObjectMetadata: ObjectMetadataEntity,
    aliasPrefix: AliasPrefix,
    relationFieldMetadataIds?: string[],
    measureFieldMetadata?: FieldMetadataEntity,
  ) {
    if (!relationFieldMetadataIds || relationFieldMetadataIds.length === 0)
      return [];
    let objectMetadata = sourceObjectMetadata;
    const sourceTableName = computeObjectTargetTable(objectMetadata);
    const queryRelations: QueryRelation[] = [];

    for (let i = 0; i < relationFieldMetadataIds.length; i++) {
      const fieldMetadataId = relationFieldMetadataIds[i];

      const relationMetadata = await this.getRelationMetadata(
        workspaceId,
        fieldMetadataId,
      );

      if (!relationMetadata) break;

      const oppositeObjectMetadata = await this.getOppositeObjectMetadata(
        relationMetadata,
        objectMetadata,
      );

      const isLastRelationField = i === relationFieldMetadataIds.length - 1;

      const queryRelation = await this.getQueryRelation(
        workspaceId,
        dataSourceSchemaName,
        objectMetadata,
        i,
        sourceTableName,
        aliasPrefix,
        oppositeObjectMetadata,
        relationMetadata,
        fieldMetadataId,
        isLastRelationField,
        measureFieldMetadata,
      );

      if (!queryRelation) break;

      queryRelations.push(queryRelation);
      objectMetadata = oppositeObjectMetadata;
    }

    return queryRelations;
  }

  private getJoinClauses(
    dataSourceSchema: string,
    chartQueryRelations: QueryRelation[],
  ): string[] {
    return chartQueryRelations.map((queryRelation, i) => {
      if (!queryRelation.joinTarget) {
        throw new Error('Missing join target');
      }

      return `JOIN ${queryRelation.withQuery ? '' : `"${dataSourceSchema}".`}"${queryRelation.tableName}" "${queryRelation.tableAlias}" ON "${queryRelation.joinTarget.tableAlias}"."${queryRelation.joinTarget.fieldName}" = "${queryRelation.tableAlias}"."${
        queryRelation.fieldName
      }"`;
    });
  }

  private getMeasureSelectColumn(
    chartMeasure: ChartQueryMeasure,
    targetQualifiedColumn: string,
  ) {
    if (!targetQualifiedColumn && chartMeasure !== ChartQueryMeasure.COUNT) {
      throw new Error(
        'Chart measure must be count when target column is undefined',
      );
    }

    switch (chartMeasure) {
      case ChartQueryMeasure.COUNT:
        return 'COUNT(*) as measure';
      case ChartQueryMeasure.AVERAGE:
        return `AVG(${targetQualifiedColumn}) as measure`;
      case ChartQueryMeasure.MIN:
        return `MIN(${targetQualifiedColumn}) as measure`;
      case ChartQueryMeasure.MAX:
        return `MAX(${targetQualifiedColumn}) as measure`;
      case ChartQueryMeasure.SUM:
        return `SUM(${targetQualifiedColumn}) as measure`;
    }
  }

  private async getFieldMetadata(workspaceId, fieldMetadataId) {
    return (
      (await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: fieldMetadataId,
        },
      })) ?? undefined
    );
  }

  private async getQualifiedColumn(
    workspaceId: string,
    targetQueryRelations: QueryRelation[],
    sourceTableName: string,
    relationFieldMetadataIds?: string[],
    measureFieldMetadata?: FieldMetadataEntity,
  ) {
    const lastTargetRelationFieldMetadataId =
      relationFieldMetadataIds?.[relationFieldMetadataIds?.length - 1];

    const lastTargetRelationFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      lastTargetRelationFieldMetadataId,
    );

    const columnName =
      measureFieldMetadata?.name ?? lastTargetRelationFieldMetadata?.name;

    const lastQueryRelation: QueryRelation | undefined =
      targetQueryRelations[targetQueryRelations.length - 1];
    const tableAlias = lastQueryRelation?.tableAlias ?? sourceTableName;

    return `"${tableAlias}"."${columnName}"`;
  }

  private async getCommonTableExpressionDefinition(
    workspaceId: string,
    dataSourceSchemaName: string,
    baseTableName: string,
    measureFieldMetadata?: FieldMetadataEntity,
  ): Promise<CommonTableExpressionDefinition | undefined> {
    if (!measureFieldMetadata) return;

    const resultSetName = `${baseTableName}_cte`; // TODO: Unique identifier

    switch (measureFieldMetadata.type) {
      case FieldMetadataType.CURRENCY:
        return {
          resultSetName,
          withQuery: `
            WITH "${resultSetName}" AS (
              SELECT
                *,
                "${measureFieldMetadata.name}AmountMicros" / 1000000.0 *
                CASE "${measureFieldMetadata.name}CurrencyCode"
                  WHEN 'EUR' THEN 1.10
                  WHEN 'GBP' THEN 1.29
                  WHEN 'USD' THEN 1.00
                  -- TODO: Get rates from external API and cache them
                  ELSE 1.0
                END AS "${measureFieldMetadata.name}"
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
    sourceObjectMetadata: ObjectMetadataEntity,
    relationFieldPath?: string[],
    measureFieldMetadata?: FieldMetadataEntity,
  ): Promise<QueryRelation> {
    const baseTableName = computeObjectTargetTable(sourceObjectMetadata);

    const commonTableExpressionDefinition =
      !relationFieldPath || relationFieldPath.length === 0
        ? await this.getCommonTableExpressionDefinition(
            workspaceId,
            dataSourceSchemaName,
            baseTableName,
            measureFieldMetadata,
          )
        : undefined;

    const tableName =
      commonTableExpressionDefinition?.resultSetName ?? baseTableName;

    return {
      tableName: tableName,
      tableAlias: tableName,
      withQuery: commonTableExpressionDefinition?.withQuery,
    };
  }

  // getChartQuery will be removed after FIELD_PATH is transformed into CHART_QUERY
  private async getChartQuery(workspaceId: string, chartId: string) {
    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);

    const chart = await repository.findOneByOrFail({ id: chartId });

    const sourceObjectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: chart?.sourceObjectNameSingular },
        },
      );

    const lastTargetFieldMetadataId = chart.target?.[chart.target?.length - 1];

    const lastTargetFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      lastTargetFieldMetadataId,
    );

    const targetMeasureFieldMetadata =
      (lastTargetFieldMetadata?.type !== FieldMetadataType.RELATION &&
        lastTargetFieldMetadata) ||
      undefined;

    const lastGroupByFieldMetadataId =
      chart.groupBy?.[chart.groupBy?.length - 1];
    const lastGroupByFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      lastGroupByFieldMetadataId,
    );
    const groupByMeasureFieldMetadata =
      (lastGroupByFieldMetadata?.type !== FieldMetadataType.RELATION &&
        lastGroupByFieldMetadata) ||
      undefined;

    const chartQuery: ChartQuery = {
      sourceObjectMetadataId: sourceObjectMetadata.id,
      target: {
        relationFieldMetadataIds: targetMeasureFieldMetadata
          ? chart.target.slice(0, -1)
          : [],
        measureFieldMetadataId: targetMeasureFieldMetadata?.id,
        measure: chart.measure,
      },
      groupBy: {
        relationFieldMetadataIds: groupByMeasureFieldMetadata
          ? chart.groupBy.slice(0, -1)
          : [],
        measureFieldMetadataId: groupByMeasureFieldMetadata?.id,
        measure: undefined,
        groups: undefined,
        includeNulls: undefined,
      },
    };

    return chartQuery;
  }

  async run(workspaceId: string, chartId: string): Promise<ChartResult> {
    const chartQuery = await this.getChartQuery(workspaceId, chartId);

    const dataSourceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const sourceObjectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { id: chartQuery.sourceObjectMetadataId },
        },
      );

    const targetMeasureFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      chartQuery.target?.measureFieldMetadataId,
    );

    const sourceQueryRelation = await this.getSourceQueryRelation(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      chartQuery.target?.relationFieldMetadataIds,
      targetMeasureFieldMetadata,
    );

    const targetQueryRelations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      'target',
      chartQuery.target?.relationFieldMetadataIds,
      targetMeasureFieldMetadata,
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
      chartQuery.target?.relationFieldMetadataIds,
      targetMeasureFieldMetadata,
    );

    const groupByMeasureFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      chartQuery.groupBy?.measureFieldMetadataId,
    );

    const groupByJoinOperations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      'group_by',
      chartQuery.groupBy?.relationFieldMetadataIds,
      groupByMeasureFieldMetadata,
    );

    const groupByQueryRelations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      'target',
      chartQuery.target?.relationFieldMetadataIds,
      targetMeasureFieldMetadata,
    );

    const groupByJoinClauses = this.getJoinClauses(
      dataSourceSchemaName,
      groupByQueryRelations,
    );

    const groupByQualifiedColumn = await this.getQualifiedColumn(
      workspaceId,
      groupByQueryRelations,
      sourceQueryRelation.tableName,
      chartQuery.groupBy?.relationFieldMetadataIds,
      groupByMeasureFieldMetadata,
    );

    const groupByClause =
      chartQuery.groupBy?.measureFieldMetadataId ||
      chartQuery.groupBy?.relationFieldMetadataIds
        ? `GROUP BY "${groupByQualifiedColumn}"`
        : '';

    const allQueryRelations = [
      sourceQueryRelation,
      targetQueryRelations,
      // groupByQueryRelations,
    ].flat();

    const commonTableExpressions = allQueryRelations
      .map((joinOperation) => joinOperation.withQuery)
      .join('\n');

    console.log('commonTableExpressions', commonTableExpressions);

    if (chartQuery.target?.measure === undefined) {
      throw new Error('Measure is currently required');
    }

    const measureSelectColumn = this.getMeasureSelectColumn(
      chartQuery.target?.measure,
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
