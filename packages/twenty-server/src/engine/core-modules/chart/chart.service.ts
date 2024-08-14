import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChartResult } from 'src/engine/core-modules/chart/dtos/chart-result.dto';
import { AliasPrefix } from 'src/engine/core-modules/chart/types/alias-prefix.type';
import { CommonTableExpressionDefinition } from 'src/engine/core-modules/chart/types/common-table-expression-definition.type';
import { JoinOperation } from 'src/engine/core-modules/chart/types/join-operation.type';
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

  private getJoinOperation(
    objectMetadata: ObjectMetadataEntity,
    index: number,
    sourceTableName: string,
    aliasPrefix: AliasPrefix,
    oppositeObjectMetadata: ObjectMetadataEntity,
    relationMetadata: RelationMetadataEntity,
  ): JoinOperation | undefined {
    const fromIsExistingTable =
      relationMetadata?.fromObjectMetadataId === objectMetadata.id;
    const toJoinFieldName = computeColumnName(
      relationMetadata.toFieldMetadata.name,
      {
        isForeignKey: true,
      },
    );
    const fromJoinFieldName = 'id';

    switch (relationMetadata?.relationType) {
      case RelationMetadataType.ONE_TO_MANY: {
        return {
          joinTableName: computeObjectTargetTable(oppositeObjectMetadata),
          joinTableAlias: this.computeJoinTableAlias(aliasPrefix, index),
          joinFieldName: fromIsExistingTable
            ? toJoinFieldName
            : fromJoinFieldName,
          existingTableAlias:
            index === 0
              ? sourceTableName
              : this.computeJoinTableAlias(aliasPrefix, index - 1),
          existingFieldName: fromIsExistingTable
            ? fromJoinFieldName
            : toJoinFieldName,
        };
      }
      default:
        throw new Error(
          `Chart query construction is not implemented for relation type '${relationMetadata?.relationType}'`,
        );
    }
  }

  private async getJoinOperations(
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
    const tables: JoinOperation[] = [];

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

      const joinOperation = this.getJoinOperation(
        objectMetadata,
        i,
        sourceTableName,
        aliasPrefix,
        oppositeObjectMetadata,
        relationMetadata,
      );

      if (!joinOperation) break;

      tables.push(joinOperation);
      objectMetadata = oppositeObjectMetadata;
    }

    return tables;
  }

  private getJoinClauses(
    dataSourceSchema: string,
    joinOperations: JoinOperation[],
  ): string[] {
    return joinOperations.map((joinOperation, i) => {
      return `JOIN "${dataSourceSchema}"."${joinOperation.joinTableName}" "${joinOperation.joinTableAlias}" ON "${joinOperation.existingTableAlias}"."${joinOperation.existingFieldName}" = "${joinOperation.joinTableAlias}"."${
        joinOperation.joinFieldName
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
    targetTableAlias: string,
    targetColumnName?: string,
  ) {
    if (!targetColumnName && chartMeasure !== ChartMeasure.COUNT) {
      throw new Error(
        'Chart measure must be count when target column is undefined',
      );
    }

    switch (chartMeasure) {
      case ChartMeasure.COUNT:
        return 'COUNT(*) as measure';
      case ChartMeasure.AVERAGE:
        return `AVG("${targetTableAlias}"."${targetColumnName}") as measure`;
      case ChartMeasure.MIN:
        return `MIN("${targetTableAlias}"."${targetColumnName}") as measure`;
      case ChartMeasure.MAX:
        return `MAX("${targetTableAlias}"."${targetColumnName}") as measure`;
      case ChartMeasure.SUM:
        return `SUM("${targetTableAlias}"."${targetColumnName}") as measure`;
    }
  }

  // Returns wrong column name if last field is not a relationship / count field
  private async getTableAliasAndColumn(
    workspaceId: string,
    joinOperations: JoinOperation[],
    sourceTableName: string,
    fieldPath?: string[],
  ) {
    const lastFieldMetadataId = fieldPath?.[fieldPath?.length - 1];

    const columnName = (
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: lastFieldMetadataId,
        },
      })
    )?.name;

    if (joinOperations.length > 0) {
      const lastJoinOperation = joinOperations[joinOperations.length - 1];

      const tableAlias = lastJoinOperation.joinTableAlias;

      return [tableAlias, columnName] as const;
    }

    const tableAlias = sourceTableName;

    return [tableAlias, columnName] as const;
  }

  private async getCommonTableExpressionDefinitions(
    selectFields: {
      tableName: string;
      fieldMetadataType: FieldMetadataType;
      fieldName: string;
    }[],
  ): Promise<CommonTableExpressionDefinition[]> {
    return selectFields
      .map(({ tableName, fieldMetadataType, fieldName }, i) => {
        const newTableName = `${tableName}_cte_${i}`;
        const replacesTableName = tableName;

        switch (fieldMetadataType) {
          case FieldMetadataType.CURRENCY:
            return {
              newTableName,
              replacesTableName,
              withQuery: `
              WITH ${newTableName} AS (
                SELECT
                  ${fieldName}AmountMicros / 1000000.0 *
                  CASE ${fieldName}CurrencyCode
                    WHEN 'EUR' THEN 1.10
                    WHEN 'GBP' THEN 1.29
                    WHEN 'USD' THEN 1.00
                    -- More
                    ELSE 1.0
                  END AS ${fieldName}
                FROM
                  ${replacesTableName}
              )
            `,
            };
        }

        return;
      })
      .filter(
        (cted): cted is CommonTableExpressionDefinition => cted !== undefined,
      );
  }

  async run(workspaceId: string, chartId: string): Promise<ChartResult> {
    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);
    const chart = await repository.findOneByOrFail({ id: chartId });

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const sourceObjectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: chart?.sourceObjectNameSingular },
        },
      );

    const sourceTableName = computeObjectTargetTable(sourceObjectMetadata);

    const targetJoinOperations = await this.getJoinOperations(
      workspaceId,
      chart.sourceObjectNameSingular,
      'target',
      chart.target,
    );

    const targetJoinClauses = this.getJoinClauses(
      dataSourceSchema,
      targetJoinOperations,
    );

    const [targetTableAlias, targetColumnName] =
      await this.getTableAliasAndColumn(
        workspaceId,
        targetJoinOperations,
        sourceTableName,
        chart.target,
      );

    const groupByJoinOperations = await this.getJoinOperations(
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
        : '';

    const commonTableExpressionDefinitions =
      await this.getCommonTableExpressionDefinitions([
        {
          tableName: targetTableAlias,
          fieldMetadataType: FieldMetadataType.CURRENCY,
          fieldName: 'annualRecurringRevenue',
        },
      ]);

    const commonTableExpressions = commonTableExpressionDefinitions
      .map(({ withQuery }) => withQuery)
      .join('\n');

    const measureSelectColumn = this.getMeasureSelectColumn(
      chart.measure,
      targetTableAlias,
      targetColumnName,
    );

    const selectColumns = [measureSelectColumn, groupBySelectColumn].filter(
      (col) => !!col,
    );

    const joinClausesString = [targetJoinClauses, groupByJoinClauses]
      .flat()
      .filter((col) => col)
      .join('\n');

    const sqlQuery = `
      ${'' /* commonTableExpressions */}
      SELECT ${selectColumns.join(', ')}
      FROM "${dataSourceSchema}"."${sourceTableName}"
      ${joinClausesString}
      ${groupByClause};
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
