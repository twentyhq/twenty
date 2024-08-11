import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChartResult } from 'src/engine/core-modules/chart/dtos/chart-result.dto';
import { AliasPrefix } from 'src/engine/core-modules/chart/types/alias-prefix.type';
import { JoinOperation } from 'src/engine/core-modules/chart/types/join-operation.type';
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
// 1. Add groupBy support
// 2. Composite type support (most importantly for currencies)

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

  private computeJoinTableAlias(aliasPrefix: AliasPrefix, i: number) {
    return `table_${aliasPrefix}_${i}`;
  }

  private async getJoinOperations(
    workspaceId: string,
    sourceObjectNameSingular: string,
    fieldPath: string[],
    aliasPrefix: AliasPrefix,
  ) {
    if (fieldPath.length < 2) return [];

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

      if (!relationMetadata) {
        break;
      }

      const oppositeObjectMetadata =
        relationMetadata?.fromObjectMetadataId === objectMetadata.id
          ? relationMetadata?.toObjectMetadata
          : relationMetadata?.fromObjectMetadata;

      if (!oppositeObjectMetadata) throw new Error();

      switch (relationMetadata?.relationType) {
        case RelationMetadataType.ONE_TO_MANY: {
          await tables.push({
            joinTableName: computeObjectTargetTable(oppositeObjectMetadata),
            joinTableAlias: this.computeJoinTableAlias(aliasPrefix, i),
            joinFieldName:
              relationMetadata?.fromObjectMetadataId === objectMetadata.id
                ? computeColumnName(relationMetadata.toFieldMetadata.name, {
                    isForeignKey: true,
                  })
                : 'id',
            existingTableAlias:
              i === 0
                ? sourceTableName
                : this.computeJoinTableAlias(aliasPrefix, i - 1),
            existingFieldName:
              relationMetadata?.fromObjectMetadataId === objectMetadata.id
                ? 'id'
                : computeColumnName(relationMetadata.toFieldMetadata.name, {
                    isForeignKey: true,
                  }),
          });
          break;
        }
        default:
          throw new Error(
            `Chart query construction is not implemented for relation type '${relationMetadata?.relationType}'`,
          );
      }

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

  private async getTargetTableAndColumn(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    fieldPath?: string[],
  ): Promise<{
    targetTableName: string;
    targetColumnName?: string;
  }> {
    if (!fieldPath) {
      return {
        targetTableName: computeObjectTargetTable(sourceObjectMetadata),
      };
    }

    const lastFieldFieldMetadataId: string | undefined =
      fieldPath[fieldPath.length - 1];

    const lastFieldFieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: lastFieldFieldMetadataId,
        },
      });

    if (!lastFieldFieldMetadata) {
      throw new Error('Invalid field metadata id');
    }

    const lastFieldObjectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: lastFieldFieldMetadata.objectMetadataId,
        },
      });

    if (!lastFieldObjectMetadata) {
      throw new Error(
        `Object metadata not found for id ${lastFieldFieldMetadata.objectMetadataId}`,
      );
    }

    return {
      targetTableName: computeObjectTargetTable(lastFieldObjectMetadata),
      targetColumnName: lastFieldFieldMetadata.name,
    };
  }

  /**
   *
   * @param chartMeasure
   * @param targetColumnName e.g. 'table_1.employees'
   * @returns
   */
  private getMeasureSelectColumn(
    chartMeasure: ChartMeasure,
    targetTableName: string,
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
        return `AVG("${targetTableName}"."${targetColumnName}") as measure`;
      case ChartMeasure.MIN:
        return `MIN("${targetTableName}"."${targetColumnName}") as measure`;
      case ChartMeasure.MAX:
        return `MAX("${targetTableName}"."${targetColumnName}") as measure`;
      case ChartMeasure.SUM:
        return `SUM("${targetTableName}"."${targetColumnName}") as measure`;
    }
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
      chart.fieldPath,
      'target',
    );

    const groupByJoinOperations = await this.getJoinOperations(
      workspaceId,
      chart.sourceObjectNameSingular,
      chart.groupBy,
      'group_by',
    );

    const lastGroupByJoinOperation =
      groupByJoinOperations[groupByJoinOperations.length - 1];

    const groupByTableName =
      groupByJoinOperations.length > 0
        ? lastGroupByJoinOperation.joinTableAlias
        : sourceTableName;

    /*     const groupByColumnName = await this.getTargetTableAndColumn(
      workspaceId,
      chart.fieldPath,
    ); */

    const targetTableName =
      targetJoinOperations.length > 0
        ? targetJoinOperations[targetJoinOperations.length - 1].joinTableAlias
        : computeObjectTargetTable(sourceObjectMetadata);

    const targetColumnName =
      targetJoinOperations.length > 0
        ? targetJoinOperations[targetJoinOperations.length - 1].joinFieldName
        : (
            await this.fieldMetadataService.findOneWithinWorkspace(
              workspaceId,
              {
                where: {
                  id: chart.fieldPath[0],
                },
              },
            )
          )?.name;

    const targetJoinClauses = this.getJoinClauses(
      dataSourceSchema,
      targetJoinOperations,
    ).join('\n');

    const groupByClause =
      chart?.groupBy && chart?.groupBy.length > 0
        ? `GROUP BY "${groupByTableName}"."${'' /* groupByColumnName */}"`
        : undefined;

    const lastTargetJoinOperation =
      targetJoinOperations[targetJoinOperations.length - 1];

    const measureSelectColumn = this.getMeasureSelectColumn(
      chart.measure,
      targetTableName,
      targetColumnName,
    );

    const selectColumns = [measureSelectColumn /* groupByColumn */].filter(
      (col) => !!col,
    );

    const joinClauses = [targetJoinClauses /* groupByJoinClauses */].join('\n');

    const sqlQuery = `
SELECT ${selectColumns.join(', ')}
FROM "${dataSourceSchema}"."${sourceTableName}"
${joinClauses}
${'' /* groupByClause */};
`.trim();

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
